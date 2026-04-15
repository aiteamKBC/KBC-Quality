"""
Learner data access layer backed by Neon PostgreSQL.

Authoritative sources verified against the live schema:
- kbc_users_data: identity, programme, employer contact, coach, OTJH, progress, RAG,
  review slots, component/KSB counts
- kbc_attendance: attendance percentage, attended/missed session counts,
  attendance history, latest attendance events

booking_review_summaries was inspected but does not cover all active learners,
so it is not used as the primary learner-page source.
"""

from __future__ import annotations

import re
from datetime import date, datetime

from django.db import connections

DB_ALIAS = "aiteamkbc"
TABLE_SCHEMA = "public"
TABLE_NAME = "kbc_users_data"
ATTENDANCE_TABLE = "kbc_attendance"

_DATE_RE = re.compile(r"(\d{2})-(\d{2})-(\d{4})")
_REVIEW_TYPE_RE = re.compile(r"^([A-Za-z &]+?)\s{2,}(\d{2}-\d{2}-\d{4})")


def _conn():
    return connections[DB_ALIAS]


def _parse_rows(cursor_rows) -> list[dict]:
    import json as _json

    result = []
    for (raw,) in cursor_rows:
        result.append(_json.loads(raw) if isinstance(raw, str) else raw)
    return result


def get_str(row: dict, candidates: list[str], fallback: str = "") -> str:
    for key in candidates:
        value = row.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
        if isinstance(value, (int, float)):
            return str(int(value)) if float(value).is_integer() else str(value)
    return fallback


def get_num(row: dict, candidates: list[str], fallback: float = 0.0) -> float:
    for key in candidates:
        value = row.get(key)
        if isinstance(value, (int, float)) and value == value:
            return float(value)
        if isinstance(value, str):
            try:
                return float(value.strip())
            except ValueError:
                pass
    return fallback


def _extract_date(text: str) -> str:
    if not text:
        return ""
    match = _DATE_RE.search(text)
    if not match:
        return ""
    dd, mm, yyyy = match.group(1), match.group(2), match.group(3)
    return f"{yyyy}-{mm}-{dd}"


def get_date(row: dict, candidates: list[str]) -> str:
    for key in candidates:
        value = row.get(key)
        if isinstance(value, (date, datetime)):
            return value.isoformat()[:10]
        if isinstance(value, str) and value.strip():
            raw = value.strip()
            try:
                return date.fromisoformat(raw[:10]).isoformat()
            except ValueError:
                iso = _extract_date(raw)
                if iso:
                    return iso
    return ""


def derive_rag(progress: float, attendance_pct: float) -> str:
    if attendance_pct < 80 or progress < 50:
        return "Red"
    if attendance_pct < 90 or progress < 75:
        return "Amber"
    return "Green"


def build_risk_flags(
    progress: float,
    attendance_pct: float,
    otjh_logged: float,
    otjh_target: float,
    otjh_status: str,
) -> list[str]:
    flags: list[str] = []
    if attendance_pct < 90:
        flags.append("Low Attendance")
    if otjh_target > 0 and otjh_logged < otjh_target * 0.75:
        flags.append("Low OTJH")
    if progress < 50:
        flags.append("Low Progress")
    if otjh_status and otjh_status.lower() not in ("ontrack", "normal", "ahead", ""):
        flag = f"OTJH: {otjh_status}"
        if flag not in flags:
            flags.append(flag)
    return flags


def format_cohort(start_date_value: str) -> str:
    if not start_date_value:
        return "Unknown"
    try:
        parsed = date.fromisoformat(start_date_value[:10])
    except (TypeError, ValueError):
        return "Unknown"
    return parsed.strftime("%b %Y")


def parse_reviews(row: dict) -> list[dict]:
    reviews: list[dict] = []
    for i in range(1, 17):
        slot_text = get_str(row, [f"Review Planned Date{i}"], "")
        status_text = get_str(row, [f"Review Status{i}"], "")
        if not slot_text:
            break

        match = _REVIEW_TYPE_RE.match(slot_text)
        if match:
            review_type = match.group(1).strip()
            planned_date = _extract_date(slot_text)
        else:
            review_type = "Review"
            planned_date = _extract_date(slot_text)

        if not planned_date:
            continue

        status_lower = status_text.lower()
        if "completed" in status_lower:
            status = "Completed"
            actual_date = _extract_date(status_text)
        elif "not started" in status_lower or "not yet" in status_lower or not status_text:
            status = "Not Started"
            actual_date = ""
        else:
            actual_date = _extract_date(status_text)
            status = "Completed" if actual_date else "Not Started"

        reviews.append(
            {
                "type": review_type,
                "planned_date": planned_date,
                "actual_date": actual_date,
                "status": status,
            }
        )

    return reviews


def next_review_from_reviews(reviews: list[dict]) -> str:
    return next(
        (review["planned_date"] for review in reviews if review["status"] != "Completed"),
        reviews[-1]["planned_date"] if reviews else "",
    )


def build_summary_text(learner: dict) -> str:
    attendance_pct = learner["attendance_pct"]
    otjh_logged = learner["otjh_logged"]
    otjh_target = learner["otjh_target"]
    progress = learner["progress"]
    completed_comp = learner["completed_comp_count"]
    total_comp = learner["total_comp_count"]
    next_review = learner["next_review"] or "not scheduled"
    attendance_scope = learner["sessions_total"]

    summary_parts = [
        f"Attendance is {attendance_pct}% across {attendance_scope} recorded sessions.",
        f"OTJH logged is {otjh_logged:g}h against a target of {otjh_target:g}h.",
        f"Programme completion is {progress}% ({completed_comp} of {total_comp} components).",
        f"Next review is {next_review}.",
    ]
    return " ".join(summary_parts)


def build_timeline(
    learner: dict,
    recent_sessions: list[dict],
) -> list[dict]:
    events: list[dict] = []

    if learner["start_date"]:
        events.append(
            {
                "id": f"start-{learner['id']}",
                "date": learner["start_date"],
                "type": "Start",
                "title": "Programme started",
                "text": f"{learner['full_name']} started {learner['programme']}.",
                "by": "kbc_users_data",
            }
        )

    if learner["attendance_pct"] < 90:
        events.append(
            {
                "id": f"alert-attendance-{learner['id']}",
                "date": recent_sessions[0]["date"] if recent_sessions else learner["start_date"],
                "type": "Alert",
                "title": "Attendance below target",
                "text": (
                    f"Attendance is {learner['attendance_pct']}% across "
                    f"{learner['sessions_total']} recorded sessions."
                ),
                "by": "kbc_attendance",
            }
        )

    for review in learner["reviews"]:
        review_date = review["actual_date"] or review["planned_date"]
        if not review_date:
            continue
        status_text = (
            f"Completed on {review['actual_date']}."
            if review["status"] == "Completed" and review["actual_date"]
            else f"Planned for {review['planned_date']}."
        )
        events.append(
            {
                "id": f"review-{learner['id']}-{review['planned_date']}-{review['type']}",
                "date": review_date,
                "type": "Review",
                "title": review["type"],
                "text": status_text,
                "by": "kbc_users_data",
            }
        )

    for index, session in enumerate(recent_sessions[:5]):
        attended = session["attendance"] == 1
        activity_pct = session["activity_pct"]
        activity_text = (
            f" Activity {activity_pct:g}%."
            if activity_pct is not None
            else ""
        )
        events.append(
            {
                "id": f"attendance-{learner['id']}-{index}",
                "date": session["date"],
                "type": "Attendance",
                "title": "Attendance session",
                "text": (
                    f"{'Attended' if attended else 'Missed'} {session['module'] or 'session'}."
                    f"{activity_text}"
                ),
                "by": "kbc_attendance",
            }
        )

    events.sort(key=lambda item: (item["date"] or "", item["id"]), reverse=True)
    return events


def normalize_learner(row: dict) -> dict:
    full_name = get_str(row, ["FullName"], "Unknown Learner")
    email = get_str(row, ["Email"], "")
    id_value = get_str(row, ["ID", "row_number"], full_name)

    coach = get_str(row, ["OwnerName"], "Unassigned")
    coach_email = get_str(row, ["OwnerEmail"], "")
    coach_id = get_str(row, ["case_owner_id"], "")

    employer = get_str(row, ["ManagerName"], "Employer not set")
    employer_email = get_str(row, ["ManagerEmail"], "")
    employer_contact = get_str(row, ["ManagerName"], "")

    programme = get_str(row, ["Program Name"], "Programme not set")
    cohort = get_str(row, ["Group"], "")

    start_date_value = get_date(row, ["Start-Date"])
    expected_end_date = get_date(row, ["End-Date"])

    reviews = parse_reviews(row)
    last_review_raw = get_str(row, ["Last Progress Review"], "")
    last_review = _extract_date(last_review_raw) if last_review_raw not in ("", "Not Yet") else ""
    next_review = next_review_from_reviews(reviews)

    otjh_target = get_num(row, ["Planned", "Minimum"])
    otjh_logged = get_num(row, ["Completed"])

    attendance_pct = max(0, min(100, round(get_num(row, ["_attendance_pct"]), 1)))
    sessions_total = int(get_num(row, ["_attendance_sessions_total"]))
    sessions_attended = int(get_num(row, ["_attendance_sessions_attended"]))
    sessions_missed = int(get_num(row, ["_attendance_sessions_missed"]))

    progress = max(0, min(100, round(get_num(row, ["CompletedComp%"]), 1)))

    coach_rag = get_str(row, ["Coach-RAG"])
    rag_status = coach_rag if coach_rag in ("Green", "Amber", "Red") else derive_rag(progress, attendance_pct)

    risk_flags = build_risk_flags(
        progress=progress,
        attendance_pct=attendance_pct,
        otjh_logged=otjh_logged,
        otjh_target=otjh_target,
        otjh_status=get_str(row, ["OTJHoursStatus"]),
    )

    if not cohort:
        cohort = format_cohort(start_date_value)

    return {
        "id": id_value,
        "full_name": full_name,
        "email": email,
        "programme": programme,
        "cohort": cohort,
        "organization_name": get_str(row, ["OrganizationName"], ""),
        "employer": employer,
        "employer_email": employer_email,
        "employer_contact": employer_contact,
        "employer_id": "",
        "coach": coach,
        "coach_email": coach_email,
        "coach_id": coach_id,
        "start_date": start_date_value,
        "expected_end_date": expected_end_date,
        "attendance_pct": attendance_pct,
        "sessions_total": sessions_total,
        "sessions_attended": sessions_attended,
        "sessions_missed": sessions_missed,
        "otjh_logged": otjh_logged,
        "otjh_target": otjh_target,
        "rag_status": rag_status,
        "risk_flags": risk_flags,
        "is_active": True,
        "last_review": last_review,
        "next_review": next_review,
        "progress": progress,
        "total_comp_count": int(get_num(row, ["TotalCompCount"])),
        "completed_comp_count": int(get_num(row, ["CompletedCompCount"])),
        "target_comp_count": int(get_num(row, ["TargetCompCount"])),
        "total_target_ksb": int(get_num(row, ["TotalTargetKSB"])),
        "total_completed_ksb": int(get_num(row, ["TotalCompletedKSB"])),
        "reviews": reviews,
    }


_ATTENDANCE_CTE = f"""
    att AS (
        SELECT
            "ID",
            ROUND(
                AVG(CASE WHEN "Attendance" IN (0, 1) THEN "Attendance" END)::numeric * 100,
                1
            ) AS att_pct,
            COUNT(*) AS sessions_total,
            COUNT(*) FILTER (WHERE "Attendance" = 1) AS sessions_attended,
            COUNT(*) FILTER (WHERE "Attendance" = 0) AS sessions_missed
        FROM "{TABLE_SCHEMA}"."{ATTENDANCE_TABLE}"
        GROUP BY "ID"
    )
"""

_LEARNER_SELECT = f"""
    to_jsonb(src) || jsonb_build_object(
        '_attendance_pct', COALESCE(att.att_pct, 0),
        '_attendance_sessions_total', COALESCE(att.sessions_total, 0),
        '_attendance_sessions_attended', COALESCE(att.sessions_attended, 0),
        '_attendance_sessions_missed', COALESCE(att.sessions_missed, 0)
    ) AS row
    FROM (
        SELECT *
        FROM "{TABLE_SCHEMA}"."{TABLE_NAME}"
        WHERE LOWER(COALESCE("Program-Status", '')) = 'active'
    ) src
    LEFT JOIN att ON att."ID" = src."ID"
"""


def list_learners() -> list[dict]:
    sql = f"""
        WITH {_ATTENDANCE_CTE}
        SELECT {_LEARNER_SELECT}
        ORDER BY src."FullName" ASC
    """
    with _conn().cursor() as cursor:
        cursor.execute(sql)
        rows = _parse_rows(cursor.fetchall())
    return [normalize_learner(row) for row in rows]


def fetch_recent_attendance_sessions(learner_id: str) -> list[dict]:
    sql = f"""
        SELECT
            date::text,
            "Attendance",
            module,
            NULLIF(TRIM(activity::text), '')::numeric
        FROM "{TABLE_SCHEMA}"."{ATTENDANCE_TABLE}"
        WHERE "ID"::text = %s
        ORDER BY date DESC, created_at DESC NULLS LAST
        LIMIT 12
    """
    with _conn().cursor() as cursor:
        cursor.execute(sql, [learner_id])
        rows = cursor.fetchall()

    return [
        {
            "date": row[0],
            "attendance": int(row[1]) if row[1] is not None else 0,
            "module": row[2] or "",
            "activity_pct": float(row[3]) if row[3] is not None else None,
        }
        for row in rows
    ]


def fetch_attendance_history(learner_id: str) -> list[dict]:
    sql = f"""
        SELECT
            TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM-01') AS month_key,
            TO_CHAR(DATE_TRUNC('month', date), 'Mon YYYY') AS month_label,
            COUNT(*) FILTER (WHERE "Attendance" = 1) AS attended,
            COUNT(*) FILTER (WHERE "Attendance" = 0) AS missed,
            COUNT(*) AS total,
            ROUND(
                AVG(CASE WHEN "Attendance" IN (0, 1) THEN "Attendance" END)::numeric * 100,
                1
            ) AS attendance_pct
        FROM "{TABLE_SCHEMA}"."{ATTENDANCE_TABLE}"
        WHERE "ID"::text = %s
        GROUP BY 1, 2
        ORDER BY 1
    """
    with _conn().cursor() as cursor:
        cursor.execute(sql, [learner_id])
        rows = cursor.fetchall()

    return [
        {
            "month": row[0],
            "label": row[1],
            "attended": int(row[2]),
            "missed": int(row[3]),
            "total": int(row[4]),
            "attendance_pct": float(row[5]) if row[5] is not None else 0.0,
        }
        for row in rows
    ]


def get_learner_by_id(learner_id: str) -> dict | None:
    sql = f"""
        WITH {_ATTENDANCE_CTE}
        SELECT row
        FROM (
            SELECT {_LEARNER_SELECT}
        ) data
        WHERE (row->>'ID') = %s
        LIMIT 1
    """
    with _conn().cursor() as cursor:
        cursor.execute(sql, [learner_id])
        row = cursor.fetchone()

    if not row:
        return None

    import json as _json

    data = _json.loads(row[0]) if isinstance(row[0], str) else row[0]
    learner = normalize_learner(data)
    learner["attendance_history"] = fetch_attendance_history(learner_id)
    learner["recent_sessions"] = fetch_recent_attendance_sessions(learner_id)
    learner["summary_text"] = build_summary_text(learner)
    learner["timeline"] = build_timeline(learner, learner["recent_sessions"])
    return learner
