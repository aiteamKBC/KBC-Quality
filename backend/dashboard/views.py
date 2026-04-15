from __future__ import annotations

from collections import defaultdict
from datetime import timedelta

from django.db import connections
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from actions.models import Action
from employers.models import Employer
from learners.db import list_learners
from safeguarding.models import SafeguardingCase


DB_ALIAS = "aiteamkbc"


def _conn():
    return connections[DB_ALIAS]


def _status_from_score(score: float) -> str:
    if score >= 80:
        return "Green"
    if score >= 65:
        return "Amber"
    return "Red"


def _safe_pct(numerator: float, denominator: float) -> float:
    if not denominator:
        return 0.0
    return round((numerator / denominator) * 100, 1)


def _summarise_learners(learners: list[dict]) -> dict:
    active_learners = [learner for learner in learners if learner.get("is_active")]
    total = len(active_learners)
    today = timezone.localdate()

    rag_counts = {"Green": 0, "Amber": 0, "Red": 0}
    attendance_sum = 0.0
    progress_sum = 0.0
    otjh_compliant = 0
    overdue_reviews = 0

    for learner in active_learners:
        rag = learner.get("rag_status", "Green")
        if rag in rag_counts:
            rag_counts[rag] += 1

        attendance_sum += learner.get("attendance_pct", 0)
        progress_sum += learner.get("progress", 0)

        otjh_target = learner.get("otjh_target", 0) or 0
        if otjh_target > 0:
            ratio = (learner.get("otjh_logged", 0) or 0) / otjh_target
            if ratio >= 0.75:
                otjh_compliant += 1

        next_review = learner.get("next_review")
        if next_review:
            try:
                if timezone.datetime.fromisoformat(next_review).date() < today:
                    overdue_reviews += 1
            except ValueError:
                pass

    avg_attendance = round(attendance_sum / total, 1) if total else 0.0
    avg_progress = round(progress_sum / total, 1) if total else 0.0
    otjh_pct = _safe_pct(otjh_compliant, total)

    open_actions = Action.objects.filter(status__in=["Open", "In Progress"]).count()
    safeguarding_alerts = SafeguardingCase.objects.filter(status__in=["Open", "Active"]).count()
    employer_count = Employer.objects.count()
    engaged_employers = Employer.objects.filter(engagement_score__gte=70).count()
    employer_engagement = _safe_pct(engaged_employers, employer_count)

    return {
        "active_learners": total,
        "avg_attendance": avg_attendance,
        "avg_progress": avg_progress,
        "otjh_compliance_pct": otjh_pct,
        "overdue_reviews": overdue_reviews,
        "open_actions": open_actions,
        "safeguarding_alerts": safeguarding_alerts,
        "employer_engagement_pct": employer_engagement,
        "rag_distribution": rag_counts,
    }


def _attendance_trend() -> list[dict]:
    today = timezone.localdate()
    start_month = today.replace(day=1) - timedelta(days=31 * 5)
    start_month = start_month.replace(day=1)

    sql = """
        SELECT
            DATE_TRUNC('month', a.date)::date AS month_start,
            ROUND(
                AVG(CASE WHEN a."Attendance" IN (0, 1) THEN a."Attendance" END)::numeric * 100,
                1
            ) AS attendance_pct
        FROM public."kbc_attendance" a
        INNER JOIN public."kbc_users_data" u ON u."ID" = a."ID"
        WHERE LOWER(COALESCE(u."Program-Status", '')) = 'active'
          AND a.date >= %s
        GROUP BY 1
        ORDER BY 1
    """
    with _conn().cursor() as cursor:
        cursor.execute(sql, [start_month])
        rows = cursor.fetchall()

    return [
        {
            "month": row[0].isoformat(),
            "label": row[0].strftime("%b"),
            "value": float(row[1]) if row[1] is not None else 0.0,
            "target": 90,
        }
        for row in rows
    ]


def _otjh_trend(active_emails: list[str]) -> list[dict]:
    if not active_emails:
        return []

    today = timezone.localdate()
    start_month = today.replace(day=1) - timedelta(days=31 * 5)
    start_month = start_month.replace(day=1)

    sql = """
        SELECT
            DATE_TRUNC('month', day_date)::date AS month_start,
            ROUND(
                AVG(
                    CASE
                        WHEN planned > 0 THEN (submitted::numeric / planned::numeric) * 100
                    END
                ),
                1
            ) AS otjh_pct,
            COUNT(*) AS review_rows
        FROM public.booking_review_summaries
        WHERE day_date >= %s
          AND learner_email IS NOT NULL
          AND learner_email <> ''
          AND LOWER(learner_email) = ANY(%s)
        GROUP BY 1
        ORDER BY 1
    """
    with _conn().cursor() as cursor:
        cursor.execute(sql, [start_month, active_emails])
        rows = cursor.fetchall()

    return [
        {
            "month": row[0].isoformat(),
            "label": row[0].strftime("%b"),
            "value": float(row[1]) if row[1] is not None else 0.0,
            "target": 80,
            "review_rows": int(row[2]),
        }
        for row in rows
    ]


def _programme_performance(learners: list[dict]) -> list[dict]:
    grouped: dict[str, list[dict]] = defaultdict(list)
    for learner in learners:
        grouped[learner.get("programme") or "Unknown"].append(learner)

    rows = []
    for programme, programme_learners in grouped.items():
        attendance = round(
            sum(learner.get("attendance_pct", 0) for learner in programme_learners) / len(programme_learners),
            1,
        )
        otjh_values = []
        for learner in programme_learners:
            target = learner.get("otjh_target", 0) or 0
            if target > 0:
                otjh_values.append(min(100.0, ((learner.get("otjh_logged", 0) or 0) / target) * 100))
        otjh = round(sum(otjh_values) / len(otjh_values), 1) if otjh_values else 0.0
        rows.append(
            {
                "name": programme,
                "attendance": attendance,
                "otjh": otjh,
                "learner_count": len(programme_learners),
            }
        )

    rows.sort(key=lambda row: row["learner_count"], reverse=True)
    return rows[:8]


def _derived_ofsted_themes(summary: dict, learners: list[dict]) -> list[dict]:
    total = max(summary["active_learners"], 1)
    green_share = _safe_pct(summary["rag_distribution"]["Green"], total)
    review_health = max(0.0, 100.0 - _safe_pct(summary["overdue_reviews"], total))
    safeguarding_score = 100.0 if summary["safeguarding_alerts"] == 0 else max(0.0, 100.0 - summary["safeguarding_alerts"] * 20.0)
    progress_docs = sum(learner.get("completed_comp_count", 0) for learner in learners)

    rows = [
        {
            "theme": "Quality of Education",
            "score": round((summary["avg_progress"] + summary["avg_attendance"]) / 2, 1),
            "evidence": progress_docs,
        },
        {
            "theme": "Behaviours & Attitudes",
            "score": round((summary["avg_attendance"] + green_share) / 2, 1),
            "evidence": summary["active_learners"],
        },
        {
            "theme": "Personal Development",
            "score": round((summary["otjh_compliance_pct"] + summary["avg_progress"]) / 2, 1),
            "evidence": sum(learner.get("total_completed_ksb", 0) for learner in learners),
        },
        {
            "theme": "Leadership & Management",
            "score": round((review_health + green_share) / 2, 1),
            "evidence": summary["open_actions"],
        },
        {
            "theme": "Safeguarding",
            "score": round(safeguarding_score, 1),
            "evidence": summary["safeguarding_alerts"],
        },
        {
            "theme": "Employer Engagement",
            "score": round(summary["employer_engagement_pct"], 1),
            "evidence": Employer.objects.count(),
        },
    ]

    for row in rows:
        row["status"] = _status_from_score(row["score"])
    return rows


def _alert_rows(learners: list[dict]) -> list[dict]:
    today = timezone.localdate()
    rows: list[dict] = []

    for learner in learners:
        next_review = learner.get("next_review")
        if next_review:
            try:
                review_date = timezone.datetime.fromisoformat(next_review).date()
                if review_date < today:
                    days_overdue = (today - review_date).days
                    rows.append(
                        {
                            "id": f"review-{learner['id']}",
                            "type": "Overdue Review",
                            "message": f"{learner['full_name']} - review overdue by {days_overdue} days",
                            "severity": "Red",
                            "learner_id": learner["id"],
                            "created_at": review_date.isoformat(),
                        }
                    )
            except ValueError:
                pass

        for flag in learner.get("risk_flags", []):
            severity = "Red" if flag in ("Low Attendance", "Low Progress", "Low OTJH") else "Amber"
            rows.append(
                {
                    "id": f"{learner['id']}-{flag}",
                    "type": flag,
                    "message": f"{learner['full_name']} - {flag}",
                    "severity": severity,
                    "learner_id": learner["id"],
                    "created_at": today.isoformat(),
                }
            )

    for case in SafeguardingCase.objects.filter(status__in=["Open", "Active"]).order_by("-updated_at")[:10]:
        rows.append(
            {
                "id": f"safeguarding-{case.id}",
                "type": "Safeguarding",
                "message": f"{case.learner_name or 'Learner'} - {case.category}",
                "severity": "Red" if case.severity in ("High", "Critical") else "Amber",
                "learner_id": case.learner_id,
                "created_at": case.updated_at.date().isoformat(),
            }
        )

    severity_order = {"Red": 0, "Amber": 1}
    rows.sort(key=lambda row: (severity_order.get(row["severity"], 2), row["created_at"]), reverse=False)
    return rows[:12]


def _recent_actions() -> list[dict]:
    rows = []
    for action in Action.objects.order_by("-created_at")[:5]:
        owner = action.owner.get_full_name().strip() if action.owner else ""
        rows.append(
            {
                "id": action.id,
                "title": action.title,
                "owner": owner or "Unassigned",
                "status": action.status,
                "priority": action.priority,
                "due_date": action.due_date.isoformat() if action.due_date else "",
            }
        )
    return rows


def _safeguarding_summary() -> dict:
    today = timezone.localdate()
    month_start = today.replace(day=1)
    return {
        "open_cases": SafeguardingCase.objects.filter(status="Open").count(),
        "active_interventions": SafeguardingCase.objects.filter(status="Active").count(),
        "resolved_this_month": SafeguardingCase.objects.filter(
            status="Resolved",
            resolved_at__date__gte=month_start,
        ).count(),
        "wellbeing_referrals": SafeguardingCase.objects.filter(category__icontains="wellbeing").count(),
    }


def _safeguarding_cases() -> list[dict]:
    rows = []
    for case in SafeguardingCase.objects.order_by("-updated_at")[:10]:
        rows.append(
            {
                "id": case.id,
                "severity": case.severity,
                "category": case.category,
                "status": case.status,
                "assigned_to": case.assigned_to.get_full_name().strip() if case.assigned_to else "Unassigned",
                "last_updated": case.updated_at.date().isoformat(),
            }
        )
    return rows


def _coach_workload(learners: list[dict]) -> list[dict]:
    today = timezone.localdate()
    actions_by_owner: dict[str, list[Action]] = defaultdict(list)
    for action in Action.objects.filter(status__in=["Open", "In Progress"]).select_related("owner"):
        owner_name = action.owner.get_full_name().strip() if action.owner else "Unassigned"
        actions_by_owner[owner_name].append(action)

    coaches: dict[str, list[dict]] = defaultdict(list)
    for learner in learners:
        coaches[learner.get("coach") or "Unassigned"].append(learner)

    rows = []
    for coach_name, coach_learners in coaches.items():
        coach_actions = actions_by_owner.get(coach_name, [])
        green_count = sum(1 for learner in coach_learners if learner.get("rag_status") == "Green")
        amber_count = sum(1 for learner in coach_learners if learner.get("rag_status") == "Amber")
        red_count = sum(1 for learner in coach_learners if learner.get("rag_status") == "Red")
        overdue_reviews = 0
        future_reviews: list[str] = []
        otjh_values = []

        for learner in coach_learners:
            next_review = learner.get("next_review")
            if next_review:
                try:
                    review_date = timezone.datetime.fromisoformat(next_review).date()
                    if review_date < today:
                        overdue_reviews += 1
                    else:
                        future_reviews.append(next_review)
                except ValueError:
                    pass

            target = learner.get("otjh_target", 0) or 0
            if target > 0:
                otjh_values.append(min(100.0, ((learner.get("otjh_logged", 0) or 0) / target) * 100))

        avg_attendance = round(
            sum(learner.get("attendance_pct", 0) for learner in coach_learners) / len(coach_learners),
            1,
        ) if coach_learners else 0.0
        avg_otjh = round(sum(otjh_values) / len(otjh_values), 1) if otjh_values else 0.0
        critical_actions = sum(1 for action in coach_actions if action.priority == "Critical")
        workload_score = min(
            100,
            round(
                (red_count * 12)
                + (amber_count * 6)
                + (overdue_reviews * 10)
                + (len(coach_actions) * 5)
                + (critical_actions * 12)
            ),
        )

        rows.append(
            {
                "id": coach_learners[0].get("coach_id") or coach_name,
                "name": coach_name,
                "initials": "".join(part[0] for part in coach_name.split() if part)[:3].upper(),
                "total_learners": len(coach_learners),
                "green_count": green_count,
                "amber_count": amber_count,
                "red_count": red_count,
                "open_actions": len(coach_actions),
                "critical_actions": critical_actions,
                "overdue_reviews": overdue_reviews,
                "next_review_due": min(future_reviews) if future_reviews else "",
                "avg_attendance": avg_attendance,
                "avg_otjh_pct": avg_otjh,
                "workload_score": workload_score,
                "learners": [
                    {
                        "id": learner["id"],
                        "full_name": learner["full_name"],
                        "programme": learner["programme"],
                        "attendance_pct": learner["attendance_pct"],
                        "otjh_pct": round(
                            min(100.0, ((learner.get("otjh_logged", 0) or 0) / learner["otjh_target"]) * 100),
                            1,
                        ) if learner.get("otjh_target", 0) else 0.0,
                        "rag_status": learner["rag_status"],
                        "risk_flags": learner["risk_flags"],
                    }
                    for learner in coach_learners[:8]
                ],
                "actions": [
                    {
                        "id": action.id,
                        "title": action.title,
                        "priority": action.priority,
                        "due_date": action.due_date.isoformat() if action.due_date else "",
                    }
                    for action in coach_actions[:5]
                ],
            }
        )

    rows.sort(key=lambda row: row["workload_score"], reverse=True)
    return rows


class DashboardOverviewView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        learners = [learner for learner in list_learners() if learner.get("is_active")]
        summary = _summarise_learners(learners)
        summary["ofsted_readiness"] = round(
            (
                summary["avg_attendance"]
                + summary["avg_progress"]
                + summary["otjh_compliance_pct"]
                + summary["employer_engagement_pct"]
            ) / 4,
            1,
        )

        active_emails = [learner["email"].strip().lower() for learner in learners if learner.get("email")]
        alerts = _alert_rows(learners)

        at_risk = [
            learner for learner in learners if learner.get("rag_status") in ("Red", "Amber")
        ]
        at_risk.sort(key=lambda learner: (0 if learner.get("rag_status") == "Red" else 1, learner.get("attendance_pct", 100)))

        return Response(
            {
                "generated_at": timezone.now().isoformat(),
                "summary": summary,
                "alerts": alerts,
                "attendance_trend": _attendance_trend(),
                "otjh_trend": _otjh_trend(active_emails),
                "programme_performance": _programme_performance(learners),
                "ofsted_themes": _derived_ofsted_themes(summary, learners),
                "at_risk_learners": at_risk[:5],
                "recent_actions": _recent_actions(),
                "safeguarding_summary": _safeguarding_summary(),
                "safeguarding_cases": _safeguarding_cases(),
                "coach_workload": _coach_workload(learners),
            }
        )


class DashboardSummaryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        learners = list_learners()
        return Response(_summarise_learners(learners))


class DashboardLearnersAtRiskView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        learners = list_learners()
        at_risk = [
            learner for learner in learners
            if learner.get("is_active") and learner.get("rag_status") in ("Red", "Amber")
        ]
        at_risk.sort(key=lambda learner: (0 if learner.get("rag_status") == "Red" else 1))
        return Response(at_risk[:20])
