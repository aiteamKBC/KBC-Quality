import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/feature/AppLayout";
import CustomSelect from "@/components/base/CustomSelect";
import KpiCard from "@/components/base/KpiCard";
import RagBadge from "@/components/base/RagBadge";
import AttendanceChart from "./components/AttendanceChart";
import OTJHChart from "./components/OTJHChart";
import RagDonutChart from "./components/RagDonutChart";
import OfstedRadarChart from "./components/OfstedRadarChart";
import ProgrammeBarChart from "./components/ProgrammeBarChart";
import CoachWorkloadPanel from "./components/CoachWorkloadPanel";
import { fetchDashboardOverview } from "@/lib/dashboardApi";
import type { DashboardOverview, DashboardOfstedTheme } from "@/types/dashboard";

function kpiStatus(value: number, greenAt: number, amberAt: number): "Green" | "Amber" | "Red" {
  if (value >= greenAt) return "Green";
  if (value >= amberAt) return "Amber";
  return "Red";
}

function formatMonthYear(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Live";
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [programme, setProgramme] = useState("All");
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchDashboardOverview();
        if (!cancelled) setDashboard(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
          setDashboard(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const programmeOptions = useMemo(() => {
    const options = dashboard?.programme_performance ?? [];
    return [
      { value: "All", label: "All Programmes", icon: "ri-book-open-line" },
      ...options.map((item) => ({ value: item.name, label: item.name, icon: "ri-graduation-cap-line" })),
    ];
  }, [dashboard]);

  const filteredProgrammePerformance = useMemo(() => {
    if (!dashboard) return [];
    if (programme === "All") return dashboard.programme_performance;
    return dashboard.programme_performance.filter((item) => item.name === programme);
  }, [dashboard, programme]);

  const filteredAtRiskLearners = useMemo(() => {
    if (!dashboard) return [];
    if (programme === "All") return dashboard.at_risk_learners;
    return dashboard.at_risk_learners.filter((learner) => learner.programme === programme);
  }, [dashboard, programme]);

  const filteredCoaches = useMemo(() => {
    if (!dashboard) return [];
    if (programme === "All") return dashboard.coach_workload;
    return dashboard.coach_workload
      .map((coach) => ({
        ...coach,
        learners: coach.learners.filter((learner) => learner.programme === programme),
        total_learners: coach.learners.filter((learner) => learner.programme === programme).length,
      }))
      .filter((coach) => coach.total_learners > 0);
  }, [dashboard, programme]);

  const ofstedOverall = dashboard?.summary.ofsted_readiness ?? 0;
  const criticalAlerts = dashboard?.alerts.filter((alert) => alert.severity === "Red") ?? [];
  const warnings = dashboard?.alerts.filter((alert) => alert.severity === "Amber") ?? [];
  const currentAttendance = dashboard?.attendance_trend.at(-1)?.value ?? dashboard?.summary.avg_attendance ?? 0;
  const currentOtjh = dashboard?.otjh_trend.at(-1)?.value ?? dashboard?.summary.otjh_compliance_pct ?? 0;
  const otjhSourceMonths = dashboard?.otjh_trend.length ?? 0;

  return (
    <AppLayout title="Executive Dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Executive Dashboard</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              KBC quality, compliance &amp; inspection readiness — {dashboard ? formatMonthYear(dashboard.generated_at) : "Live data"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CustomSelect value={programme} onChange={setProgramme} options={programmeOptions} className="w-56" />
            <button onClick={() => window.location.reload()} className="btn-secondary flex items-center gap-1.5">
              <i className="ri-refresh-line text-xs"></i> Refresh
            </button>
          </div>
        </div>

        {loading && <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">Loading live dashboard data...</div>}
        {!loading && error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-600">{error}</div>}

        {!loading && !error && dashboard && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <KpiCard title="Active Learners" value={dashboard.summary.active_learners} status="Green" icon="ri-user-3-line" />
              <KpiCard title="Avg Attendance" value={dashboard.summary.avg_attendance} status={kpiStatus(dashboard.summary.avg_attendance, 90, 80)} icon="ri-calendar-check-line" suffix="%" />
              <KpiCard title="OTJH Compliance" value={dashboard.summary.otjh_compliance_pct} status={kpiStatus(dashboard.summary.otjh_compliance_pct, 80, 65)} icon="ri-timer-line" suffix="%" />
              <KpiCard title="Overdue Reviews" value={dashboard.summary.overdue_reviews} status={dashboard.summary.overdue_reviews > 0 ? "Red" : "Green"} icon="ri-alarm-warning-line" />
              <KpiCard title="Open Actions" value={dashboard.summary.open_actions} status={dashboard.summary.open_actions > 0 ? "Amber" : "Green"} icon="ri-task-line" />
              <KpiCard title="Safeguarding Alerts" value={dashboard.summary.safeguarding_alerts} status={dashboard.summary.safeguarding_alerts > 0 ? "Amber" : "Green"} icon="ri-heart-pulse-line" />
              <KpiCard title="Ofsted Readiness" value={dashboard.summary.ofsted_readiness} status={kpiStatus(dashboard.summary.ofsted_readiness, 80, 65)} icon="ri-shield-star-line" suffix="%" />
              <KpiCard title="Employer Engagement" value={dashboard.summary.employer_engagement_pct} status={kpiStatus(dashboard.summary.employer_engagement_pct, 70, 50)} icon="ri-building-2-line" suffix="%" />
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <i className="ri-alarm-warning-line text-red-500"></i>
                <span className="text-sm font-semibold text-red-800">
                  {criticalAlerts.length} critical alerts · {warnings.length} warnings require attention
                </span>
                <button onClick={() => navigate("/learners")} className="ml-auto cursor-pointer whitespace-nowrap text-xs font-medium text-red-700 hover:underline">
                  View all &rarr;
                </button>
              </div>
              {dashboard.alerts.length === 0 ? (
                <div className="text-xs text-slate-500">No current operational alerts</div>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {dashboard.alerts.slice(0, 4).map((alert) => (
                    <div key={alert.id} className="flex items-center gap-3 rounded-md bg-white/60 px-3 py-2">
                      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${alert.severity === "Red" ? "bg-red-500" : "bg-amber-400"}`}></span>
                      <span className={`w-28 flex-shrink-0 text-xs font-semibold ${alert.severity === "Red" ? "text-red-700" : "text-amber-700"}`}>{alert.type}</span>
                      <span className="truncate text-xs text-slate-600">{alert.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Attendance Trend</h3>
                    <p className="text-xs text-slate-400">vs 90% target · latest available months</p>
                  </div>
                </div>
                <AttendanceChart data={dashboard.attendance_trend} />
                <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-2">
                  <span className="text-xs text-slate-400">Current: <span className="font-semibold text-slate-700">{currentAttendance}%</span></span>
                  <span className={`badge border ${currentAttendance >= 90 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : currentAttendance >= 80 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                    {Math.round((currentAttendance - 90) * 10) / 10}% vs target
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">OTJH Compliance</h3>
                    <p className="text-xs text-slate-400">vs 80% target · {otjhSourceMonths > 0 ? "review-summary months" : "no monthly history available"}</p>
                  </div>
                </div>
                <OTJHChart data={dashboard.otjh_trend} />
                <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-2">
                  <span className="text-xs text-slate-400">Current: <span className="font-semibold text-slate-700">{currentOtjh}%</span></span>
                  <span className={`badge border ${currentOtjh >= 80 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : currentOtjh >= 65 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                    {Math.round((currentOtjh - 80) * 10) / 10}% vs target
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Learner RAG Status</h3>
                    <p className="text-xs text-slate-400">Current cohort breakdown</p>
                  </div>
                </div>
                <RagDonutChart ragDistribution={dashboard.summary.rag_distribution} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-3">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Programme Performance</h3>
                    <p className="text-xs text-slate-400">Attendance &amp; OTJH by real programme values</p>
                  </div>
                  <button onClick={() => navigate("/learners")} className="cursor-pointer text-xs text-brand-600 hover:underline">
                    Learner detail &rarr;
                  </button>
                </div>
                <ProgrammeBarChart data={filteredProgrammePerformance} />
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Ofsted Readiness</h3>
                    <p className="text-xs text-slate-400">Derived from live operational metrics</p>
                  </div>
                  <button onClick={() => navigate("/ofsted")} className="cursor-pointer text-xs text-brand-600 hover:underline">
                    Full report &rarr;
                  </button>
                </div>
                <OfstedRadarChart data={dashboard.ofsted_themes} />
                <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span>Strong (80%+)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400"></span>Developing (65-79%)</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Ofsted Readiness by Theme</h3>
                  <p className="text-xs text-slate-400">Overall readiness score: {ofstedOverall}%</p>
                </div>
                <button onClick={() => navigate("/ofsted")} className="btn-secondary text-xs">Full Report &rarr;</button>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {dashboard.ofsted_themes.map((theme: DashboardOfstedTheme) => (
                  <div key={theme.theme} className="rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200">
                    <div className="mb-2 flex items-start justify-between">
                      <span className="text-xs font-medium leading-tight text-slate-700">{theme.theme}</span>
                      <RagBadge status={theme.status} />
                    </div>
                    <div className="mb-1.5 flex items-end justify-between">
                      <span className="text-xl font-bold text-slate-900">{theme.score}%</span>
                      <span className="text-xs text-slate-400">{theme.evidence} signals</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-1.5 rounded-full ${theme.status === "Green" ? "bg-emerald-500" : theme.status === "Amber" ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${theme.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">At-Risk Learners</h3>
                    <p className="text-xs text-slate-400">Live learners requiring attention</p>
                  </div>
                  <button onClick={() => navigate("/learners")} className="cursor-pointer text-xs text-brand-600 hover:underline">
                    View all &rarr;
                  </button>
                </div>
                <div className="space-y-2">
                  {filteredAtRiskLearners.length === 0 && <div className="text-sm text-slate-400">No at-risk learners for this filter</div>}
                  {filteredAtRiskLearners.map((learner) => (
                    <div key={learner.id} onClick={() => navigate(`/learners/${learner.id}`)} className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2.5 transition-colors hover:border-slate-100 hover:bg-slate-50">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {learner.full_name.split(" ").map((part) => part[0]).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-800">{learner.full_name}</div>
                        <div className="truncate text-xs text-slate-400">{learner.programme} · {learner.coach}</div>
                      </div>
                      <div className="hidden flex-shrink-0 items-center gap-3 sm:flex">
                        <div className="text-right">
                          <div className="text-xs font-medium text-slate-700">{learner.attendance_pct}%</div>
                          <div className="text-xs text-slate-400">attend.</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-slate-700">
                            {learner.otjh_target > 0 ? Math.round((learner.otjh_logged / learner.otjh_target) * 100) : 0}%
                          </div>
                          <div className="text-xs text-slate-400">OTJH</div>
                        </div>
                        <RagBadge status={learner.rag_status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Recent Actions</h3>
                    <p className="text-xs text-slate-400">{dashboard.summary.open_actions} open actions</p>
                  </div>
                  <button onClick={() => navigate("/actions")} className="cursor-pointer text-xs text-brand-600 hover:underline">
                    View all &rarr;
                  </button>
                </div>
                <div className="space-y-2">
                  {dashboard.recent_actions.length === 0 ? (
                    <div className="text-sm text-slate-400">No action records in the database</div>
                  ) : (
                    dashboard.recent_actions.map((action) => {
                      const priorityColor: Record<string, string> = {
                        Critical: "bg-red-50 text-red-700 border border-red-200",
                        High: "bg-amber-50 text-amber-700 border border-amber-200",
                        Medium: "bg-slate-100 text-slate-600",
                        Low: "bg-slate-50 text-slate-400",
                      };
                      const statusColor: Record<string, string> = {
                        Open: "text-slate-500",
                        "In Progress": "text-brand-600",
                        Completed: "text-emerald-600",
                        Escalated: "text-red-600",
                      };
                      return (
                        <div key={action.id} onClick={() => navigate("/actions")} className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2.5 transition-colors hover:border-slate-100 hover:bg-slate-50">
                          <span className={`badge mt-0.5 flex-shrink-0 ${priorityColor[action.priority] ?? "bg-slate-100 text-slate-600"}`}>{action.priority}</span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium leading-snug text-slate-800">{action.title}</div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="text-xs text-slate-400">{action.owner}</span>
                              {action.due_date && <>
                                <span className="text-slate-200">·</span>
                                <span className="text-xs text-slate-400">{action.due_date}</span>
                              </>}
                            </div>
                          </div>
                          <span className={`mt-0.5 flex-shrink-0 text-xs font-medium ${statusColor[action.status] ?? "text-slate-500"}`}>{action.status}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <CoachWorkloadPanel coaches={filteredCoaches} />

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Safeguarding Overview</h3>
                  <p className="text-xs text-slate-400">Live safeguarding case summary from Django models</p>
                </div>
                <button onClick={() => navigate("/safeguarding")} className="btn-secondary text-xs">Full Dashboard &rarr;</button>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: "Open Cases", value: dashboard.safeguarding_summary.open_cases, icon: "ri-folder-open-line", color: "text-amber-600 bg-amber-50" },
                  { label: "Active Interventions", value: dashboard.safeguarding_summary.active_interventions, icon: "ri-heart-pulse-line", color: "text-red-600 bg-red-50" },
                  { label: "Resolved This Month", value: dashboard.safeguarding_summary.resolved_this_month, icon: "ri-check-double-line", color: "text-emerald-600 bg-emerald-50" },
                  { label: "Wellbeing Referrals", value: dashboard.safeguarding_summary.wellbeing_referrals, icon: "ri-user-heart-line", color: "text-brand-600 bg-brand-50" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${item.color}`}>
                      <i className={`${item.icon} text-sm`}></i>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{item.value}</div>
                      <div className="text-xs leading-tight text-slate-500">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="table-th">Case ID</th>
                      <th className="table-th">Severity</th>
                      <th className="table-th">Category</th>
                      <th className="table-th">Status</th>
                      <th className="table-th">Assigned To</th>
                      <th className="table-th">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.safeguarding_cases.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>No safeguarding cases found</td>
                      </tr>
                    ) : (
                      dashboard.safeguarding_cases.map((caseItem) => (
                        <tr key={caseItem.id} className="table-row">
                          <td className="table-td font-mono text-xs">{caseItem.id}</td>
                          <td className="table-td">
                            <RagBadge status={caseItem.severity === "Medium" ? "Amber" : caseItem.severity === "High" || caseItem.severity === "Critical" ? "Red" : "Green"} />
                          </td>
                          <td className="table-td text-xs">{caseItem.category}</td>
                          <td className="table-td">
                            <span className={`badge ${caseItem.status === "Active" || caseItem.status === "Open" ? "border border-amber-200 bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{caseItem.status}</span>
                          </td>
                          <td className="table-td text-xs">{caseItem.assigned_to}</td>
                          <td className="table-td text-xs text-slate-400">{caseItem.last_updated}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
