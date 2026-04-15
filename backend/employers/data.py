from __future__ import annotations

import hashlib
from collections import Counter, defaultdict
from statistics import mean

from django.db import connections

from actions.models import Action
from learners.db import list_learners


DB_ALIAS = "aiteamkbc"


def _conn():
    return connections[DB_ALIAS]


def _employer_id(name: str) -> str:
    digest = hashlib.md5(name.strip().lower().encode("utf-8")).hexdigest()[:8]
    slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in name.strip())
    slug = "-".join(part for part in slug.split("-") if part) or "employer"
    return f"{slug}-{digest}"


def _score_status(score: float) -> str:
    if score >= 80:
        return "Green"
    if score >= 65:
        return "Amber"
    return "Red"


def _otjh_pct(learner: dict) -> float:
    target = learner.get("otjh_target", 0) or 0
    logged = learner.get("otjh_logged", 0) or 0
    if target <= 0:
        return 0.0
    return round(min(100.0, (logged / target) * 100), 1)


def _latest_attendance_dates() -> dict[str, str]:
    sql = """
        SELECT
            u."OrganizationName",
            MAX(a.date)::date AS latest_date
        FROM public."kbc_users_data" u
        LEFT JOIN public."kbc_attendance" a ON a."ID" = u."ID"
        WHERE LOWER(COALESCE(u."Program-Status", '')) = 'active'
          AND COALESCE(TRIM(u."OrganizationName"), '') <> ''
        GROUP BY 1
    """
    with _conn().cursor() as cursor:
        cursor.execute(sql)
        rows = cursor.fetchall()
    return {
        org_name.strip(): latest_date.isoformat()
        for org_name, latest_date in rows
        if isinstance(org_name, str) and org_name.strip() and latest_date
    }


def _recent_attendance_for_org(org_name: str, limit: int = 20) -> list[dict]:
    sql = """
        SELECT
            u."ID"::text,
            u."FullName",
            a.date::date,
            COALESCE(a.module, ''),
            a."Attendance"
        FROM public."kbc_users_data" u
        INNER JOIN public."kbc_attendance" a ON a."ID" = u."ID"
        WHERE LOWER(COALESCE(u."Program-Status", '')) = 'active'
          AND u."OrganizationName" = %s
        ORDER BY a.date DESC, a.created_at DESC NULLS LAST
        LIMIT %s
    """
    with _conn().cursor() as cursor:
        cursor.execute(sql, [org_name, limit])
        rows = cursor.fetchall()
    return [
        {
            "learner_id": learner_id,
            "learner_name": learner_name,
            "date": event_date.isoformat() if event_date else "",
            "module": module or "",
            "attendance": int(attendance) if attendance is not None else None,
        }
        for learner_id, learner_name, event_date, module, attendance in rows
    ]


def _action_rows(learner_ids: list[str]) -> list[dict]:
    if not learner_ids:
        return []
    rows = []
    for action in Action.objects.filter(linked_learner_id__in=learner_ids).order_by("-created_at")[:20]:
        owner = action.owner.get_full_name().strip() if action.owner else ""
        rows.append(
            {
                "id": action.id,
                "title": action.title,
                "priority": action.priority,
                "status": action.status,
                "due_date": action.due_date.isoformat() if action.due_date else "",
                "owner": owner or "Unassigned",
                "category": action.category,
            }
        )
    return rows


def _summary_text(employer: dict) -> str:
    return (
        f"{employer['name']} has {employer['learner_count']} active learners. "
        f"Average attendance is {employer['avg_attendance']}%, progress is {employer['avg_progress']}%, "
        f"and OTJH completion is {employer['avg_otjh_pct']}%. "
        f"{employer['concerns']} learners currently show live risk indicators."
    )


def _timeline_rows(employer: dict, attendance_events: list[dict]) -> list[dict]:
    events: list[dict] = []
    for learner in employer["learners"]:
        if learner.get("last_review"):
            events.append(
                {
                    "id": f"review-last-{learner['id']}",
                    "date": learner["last_review"],
                    "type": "Review",
                    "title": "Latest review completed",
                    "text": f"{learner['full_name']} recorded a completed review.",
                }
            )
        if learner.get("next_review"):
            events.append(
                {
                    "id": f"review-next-{learner['id']}",
                    "date": learner["next_review"],
                    "type": "Review",
                    "title": "Upcoming review",
                    "text": f"{learner['full_name']} has a scheduled review.",
                }
            )

    for index, event in enumerate(attendance_events):
        attended = event["attendance"] == 1
        events.append(
            {
                "id": f"attendance-{index}-{event['learner_id']}",
                "date": event["date"],
                "type": "Attendance",
                "title": "Attendance session",
                "text": (
                    f"{event['learner_name']} {'attended' if attended else 'missed'} "
                    f"{event['module'] or 'a recorded session'}."
                ),
            }
        )

    events.sort(key=lambda item: (item["date"], item["id"]), reverse=True)
    return events[:24]


def _build_employer_rows() -> list[dict]:
    grouped: dict[str, list[dict]] = defaultdict(list)
    for learner in list_learners():
        if not learner.get("is_active"):
            continue
        org_name = (learner.get("organization_name") or "").strip()
        if not org_name:
            continue
        grouped[org_name].append(learner)

    latest_attendance = _latest_attendance_dates()
    rows = []

    for org_name, learners in grouped.items():
        contact_counts = Counter(
            (learner.get("employer_contact") or "Unassigned").strip() or "Unassigned"
            for learner in learners
        )
        primary_contact = contact_counts.most_common(1)[0][0]
        contact_email = next(
            (
                learner.get("employer_email", "")
                for learner in learners
                if (learner.get("employer_contact") or "").strip() == primary_contact and learner.get("employer_email")
            ),
            "",
        )

        programme_counts = Counter(learner.get("programme") or "Programme not set" for learner in learners)
        primary_programme = programme_counts.most_common(1)[0][0]
        avg_attendance = round(mean(learner.get("attendance_pct", 0) for learner in learners), 1)
        avg_progress = round(mean(learner.get("progress", 0) for learner in learners), 1)
        otjh_values = [_otjh_pct(learner) for learner in learners if (learner.get("otjh_target", 0) or 0) > 0]
        avg_otjh = round(mean(otjh_values), 1) if otjh_values else 0.0
        engagement_score = round((avg_attendance + avg_progress + avg_otjh) / 3, 1)
        concerns = sum(
            1
            for learner in learners
            if learner.get("rag_status") == "Red" or bool(learner.get("risk_flags"))
        )

        learner_ids = [str(learner["id"]) for learner in learners]
        actions = _action_rows(learner_ids)
        latest_review = max((learner.get("last_review") or "" for learner in learners), default="")
        latest_activity = max(
            latest_attendance.get(org_name, ""),
            latest_review,
            max((learner.get("start_date") or "" for learner in learners), default=""),
        )
        reviews_due = sum(1 for learner in learners if learner.get("next_review"))

        employer = {
            "id": _employer_id(org_name),
            "name": org_name,
            "contact_name": primary_contact,
            "contact_email": contact_email,
            "primary_programme": primary_programme,
            "programme_count": len(programme_counts),
            "learner_count": len(learners),
            "engagement_score": engagement_score,
            "rag_status": _score_status(engagement_score),
            "concerns": concerns,
            "avg_attendance": avg_attendance,
            "avg_progress": avg_progress,
            "avg_otjh_pct": avg_otjh,
            "latest_activity": latest_activity,
            "reviews_due": reviews_due,
            "linked_actions_count": len(actions),
            "learners": sorted(learners, key=lambda learner: learner["full_name"]),
            "actions": actions,
        }
        employer["summary_text"] = _summary_text(employer)
        rows.append(employer)

    rows.sort(key=lambda row: (row["name"].lower(), row["id"]))
    return rows


def list_employers() -> list[dict]:
    return _build_employer_rows()


def get_employer_by_id(employer_id: str) -> dict | None:
    for employer in _build_employer_rows():
        if employer["id"] != employer_id:
            continue
        attendance_events = _recent_attendance_for_org(employer["name"])
        employer["recent_activity"] = attendance_events
        employer["timeline"] = _timeline_rows(employer, attendance_events)
        return employer
    return None
