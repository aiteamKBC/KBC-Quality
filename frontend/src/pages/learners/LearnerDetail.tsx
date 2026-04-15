import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/components/feature/AppLayout";
import RagBadge from "@/components/base/RagBadge";
import { fetchLearner } from "@/lib/learnersApi";
import type { Learner } from "@/types/learners";
import LearnerAttendanceChart from "./components/LearnerAttendanceChart";
import LearnerOTJHChart from "./components/LearnerOTJHChart";
import LearnerProgressChart from "./components/LearnerProgressChart";
import LearnerTimeline from "./components/LearnerTimeline";

const tabs = ["Overview", "Attendance & OTJH", "Progress Reviews", "Notes & Timeline", "Evidence", "Actions", "Safeguarding"];

export default function LearnerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [learner, setLearner] = useState<Learner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing learner id");
      return;
    }

    let cancelled = false;

    async function loadLearner() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchLearner(id);
        if (!cancelled) {
          setLearner(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setLearner(null);
          setError(loadError instanceof Error ? loadError.message : "Failed to load learner");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadLearner();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AppLayout title="Loading learner">
        <div className="py-20 text-center text-slate-400">Loading learner from Neon...</div>
      </AppLayout>
    );
  }

  if (!learner) {
    return (
      <AppLayout title="Learner Not Found">
        <div className="py-20 text-center text-slate-400">
          <i className="ri-user-unfollow-line mb-3 block text-5xl text-slate-300"></i>
          <p className="text-lg font-medium text-slate-600">{error || "Learner not found"}</p>
          <button onClick={() => navigate("/learners")} className="btn-primary mt-4">
            <i className="ri-arrow-left-line mr-1"></i> Back to Learners
          </button>
        </div>
      </AppLayout>
    );
  }

  const learnerEvidence: unknown[] = [];
  const learnerActions: unknown[] = [];
  const reviews = learner.reviews;
  const attendanceHistory = learner.attendance_history ?? [];
  const timeline = learner.timeline ?? [];
  const otjhPct = learner.otjh_target > 0 ? Math.round((learner.otjh_logged / learner.otjh_target) * 100) : 0;
  const otjhRemaining = Math.max(0, learner.otjh_target - learner.otjh_logged);

  const attStatus = learner.attendance_pct >= 90 ? "Green" : learner.attendance_pct >= 80 ? "Amber" : "Red";
  const otjhStatus = otjhPct >= 85 ? "Green" : otjhPct >= 70 ? "Amber" : "Red";
  const progStatus = learner.progress >= 80 ? "Green" : learner.progress >= 60 ? "Amber" : "Red";

  const latestAttendance = learner.recent_sessions?.[0];

  return (
    <AppLayout title={learner.full_name}>
      <div className="space-y-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <button onClick={() => navigate("/learners")} className="cursor-pointer transition-colors hover:text-brand-600">
            Learners
          </button>
          <i className="ri-arrow-right-s-line"></i>
          <span className="font-medium text-slate-700">{learner.full_name}</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className={`h-1.5 w-full ${learner.rag_status === "Green" ? "bg-emerald-500" : learner.rag_status === "Amber" ? "bg-amber-400" : "bg-red-500"}`}></div>

          <div className="p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <div className="relative flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-700 text-xl font-bold text-white">
                  {learner.full_name.split(" ").map((name) => name[0]).join("")}
                </div>
                <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${learner.rag_status === "Green" ? "bg-emerald-500" : learner.rag_status === "Amber" ? "bg-amber-400" : "bg-red-500"}`}></span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{learner.full_name}</h2>
                    <p className="mt-0.5 text-sm text-slate-500">{learner.email}</p>
                  </div>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <RagBadge status={learner.rag_status} size="md" />
                    {learner.risk_flags.map((flag) => (
                      <span key={flag} className="badge border border-red-200 bg-red-50 text-xs text-red-600">
                        <i className="ri-alarm-warning-line mr-1"></i>
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { icon: "ri-book-open-line", label: "Programme", value: learner.programme },
                    { icon: "ri-building-2-line", label: "Employer", value: learner.employer },
                    { icon: "ri-user-3-line", label: "Coach", value: learner.coach },
                    { icon: "ri-group-line", label: "Cohort", value: learner.cohort },
                    { icon: "ri-calendar-line", label: "Start Date", value: learner.start_date || "N/A" },
                    { icon: "ri-calendar-check-line", label: "Expected End", value: learner.expected_end_date || "N/A" },
                    { icon: "ri-time-line", label: "Last Review", value: learner.last_review || "N/A" },
                  ].map((field) => (
                    <div key={field.label} className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-slate-100">
                        <i className={`${field.icon} text-xs text-slate-400`}></i>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">{field.label}</div>
                        <div className="mt-0.5 text-xs font-semibold text-slate-800">{field.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 md:grid-cols-4">
              {[
                {
                  label: "Attendance",
                  value: `${learner.attendance_pct}%`,
                  status: attStatus,
                  icon: "ri-calendar-check-line",
                  sub: `${learner.sessions_attended}/${learner.sessions_total} sessions attended`,
                },
                {
                  label: "OTJH",
                  value: `${otjhPct}%`,
                  status: otjhStatus,
                  icon: "ri-timer-line",
                  sub: `${learner.otjh_logged}h of ${learner.otjh_target}h`,
                },
                {
                  label: "Progress",
                  value: `${learner.progress}%`,
                  status: progStatus,
                  icon: "ri-bar-chart-line",
                  sub: `${learner.completed_comp_count}/${learner.total_comp_count} components`,
                },
                {
                  label: "Reviews",
                  value: `${reviews.filter((review) => review.status === "Not Started").length}`,
                  status: "neutral",
                  icon: "ri-calendar-event-line",
                  sub: "scheduled reviews",
                },
              ].map((kpi) => (
                <div key={kpi.label} className={`rounded-lg border p-3.5 ${kpi.status === "Green" ? "border-emerald-100 bg-emerald-50" : kpi.status === "Amber" ? "border-amber-100 bg-amber-50" : kpi.status === "Red" ? "border-red-100 bg-red-50" : "border-slate-100 bg-slate-50"}`}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <i className={`${kpi.icon} text-sm ${kpi.status === "Green" ? "text-emerald-500" : kpi.status === "Amber" ? "text-amber-500" : kpi.status === "Red" ? "text-red-500" : "text-slate-400"}`}></i>
                    <span className="text-xs text-slate-500">{kpi.label}</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{kpi.value}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{kpi.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex overflow-x-auto border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-item flex-shrink-0 ${activeTab === tab ? "tab-active" : "tab-inactive"}`}
              >
                {tab === "Evidence" && learnerEvidence.length > 0 && (
                  <span className="badge ml-1 bg-brand-100 py-0 text-xs text-brand-600">{learnerEvidence.length}</span>
                )}
                {tab === "Actions" && learnerActions.length > 0 && (
                  <span className="badge ml-1 bg-red-100 py-0 text-xs text-red-600">{learnerActions.length}</span>
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === "Overview" && (
              <div className="space-y-5">
                <div className="overflow-hidden rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-slate-50">
                  <div className="flex items-center gap-2 px-5 py-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
                      <i className="ri-database-2-line text-xs text-white"></i>
                    </div>
                    <span className="text-sm font-semibold text-brand-900">Live Learner Summary</span>
                    <span className="badge bg-brand-100 text-xs text-brand-600">Neon-backed</span>
                  </div>
                  <div className="px-5 pb-4">
                    <p className="text-sm leading-relaxed text-slate-700">{learner.summary_text}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <i className="ri-alarm-warning-line text-slate-400"></i> Risk Flags
                    </h3>
                    {learner.risk_flags.length === 0 ? (
                      <div className="flex items-center gap-2.5 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                        <i className="ri-checkbox-circle-line text-lg text-emerald-500"></i>
                        <div>
                          <p className="text-sm font-medium text-emerald-800">No active risk flags</p>
                          <p className="text-xs text-emerald-600">No risk rules were triggered by the live learner metrics</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {learner.risk_flags.map((flag) => (
                          <div key={flag} className="flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 p-3">
                            <i className="ri-alarm-warning-line mt-0.5 text-red-500"></i>
                            <div>
                              <p className="text-sm font-medium text-red-800">{flag}</p>
                              <p className="text-xs text-red-500">Derived from live attendance, OTJH, progress, or coach RAG data</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <i className="ri-bar-chart-line text-slate-400"></i> KPI Counts
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Components Completed", value: learner.completed_comp_count, sub: `of ${learner.total_comp_count}` },
                        { label: "Components On Target", value: learner.target_comp_count, sub: `target rows in kbc_users_data` },
                        { label: "KSB Completed", value: learner.total_completed_ksb, sub: `of ${learner.total_target_ksb}` },
                        { label: "Sessions Missed", value: learner.sessions_missed, sub: `of ${learner.sessions_total}` },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                          <div className="text-xs text-slate-400">{item.label}</div>
                          <div className="mt-1 text-lg font-bold text-slate-900">{item.value}</div>
                          <div className="mt-0.5 text-xs text-slate-400">{item.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
                    <button onClick={() => setActiveTab("Notes & Timeline")} className="cursor-pointer text-xs text-brand-600 hover:underline">
                      Full timeline &rarr;
                    </button>
                  </div>
                  <div className="space-y-3">
                    {timeline.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-start gap-3">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                          <i className={`${event.type === "Alert" ? "ri-alarm-warning-line text-red-500" : event.type === "Review" ? "ri-clipboard-line text-brand-500" : event.type === "Attendance" ? "ri-calendar-check-line text-amber-500" : "ri-flag-line text-emerald-500"} text-xs`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-700">{event.text}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{event.date}</p>
                        </div>
                      </div>
                    ))}
                    {timeline.length === 0 && <div className="text-sm text-slate-400">No learner activity records found</div>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Attendance & OTJH" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">Attendance Record</h3>
                        <p className="text-xs text-slate-400">Monthly attendance aggregated from `kbc_attendance`</p>
                      </div>
                      <RagBadge status={attStatus} />
                    </div>
                    <LearnerAttendanceChart history={attendanceHistory} />
                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                      {[
                        { label: "Overall", value: `${learner.attendance_pct}%`, color: attStatus === "Green" ? "text-emerald-600" : attStatus === "Amber" ? "text-amber-600" : "text-red-600" },
                        { label: "Sessions Attended", value: `${learner.sessions_attended}`, color: "text-slate-800" },
                        { label: "Sessions Missed", value: `${learner.sessions_missed}`, color: "text-slate-800" },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-lg bg-slate-50 p-2.5 text-center">
                          <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                          <div className="text-xs text-slate-400">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    {latestAttendance && (
                      <div className="mt-3 text-xs text-slate-400">
                        Latest attendance record: {latestAttendance.date} • {latestAttendance.attendance === 1 ? "Attended" : "Missed"} • {latestAttendance.module || "Session"}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">Off-the-Job Hours (OTJH)</h3>
                        <p className="text-xs text-slate-400">Live comparison between logged and target hours</p>
                      </div>
                      <RagBadge status={otjhStatus} />
                    </div>
                    <LearnerOTJHChart logged={learner.otjh_logged} target={learner.otjh_target} />
                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                      {[
                        { label: "Logged", value: `${learner.otjh_logged}h`, color: "text-brand-600" },
                        { label: "Target", value: `${learner.otjh_target}h`, color: "text-slate-800" },
                        { label: "Remaining", value: `${otjhRemaining}h`, color: otjhRemaining > 0 ? "text-amber-600" : "text-emerald-600" },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-lg bg-slate-50 p-2.5 text-center">
                          <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                          <div className="text-xs text-slate-400">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Programme Progress</h3>
                      <p className="text-xs text-slate-400">Current completion metrics from `kbc_users_data`</p>
                    </div>
                    <RagBadge status={progStatus} />
                  </div>
                  <LearnerProgressChart
                    progress={learner.progress}
                    completedComponents={learner.completed_comp_count}
                    totalComponents={learner.total_comp_count}
                    completedKsb={learner.total_completed_ksb}
                    totalKsb={learner.total_target_ksb}
                  />
                </div>
              </div>
            )}

            {activeTab === "Progress Reviews" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="grid flex-1 grid-cols-3 gap-3">
                    {[
                      { label: "Completed", count: reviews.filter((review) => review.status === "Completed").length, color: "border-emerald-100 bg-emerald-50 text-emerald-600" },
                      { label: "Upcoming", count: reviews.filter((review) => review.status === "Not Started").length, color: "border-brand-100 bg-brand-50 text-brand-600" },
                      { label: "Pending", count: reviews.filter((review) => review.status === "Not Started" && !review.actual_date).length, color: "border-amber-100 bg-amber-50 text-amber-600" },
                    ].map((summary) => (
                      <div key={summary.label} className={`rounded-lg border p-3 text-center ${summary.color}`}>
                        <div className="text-xl font-bold">{summary.count}</div>
                        <div className="mt-0.5 text-xs font-medium">{summary.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="table-th">Date</th>
                        <th className="table-th">Coach</th>
                        <th className="table-th">Status</th>
                        <th className="table-th">Signed</th>
                        <th className="table-th">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review, index) => (
                        <tr key={`${review.planned_date}-${index}`} className="table-row">
                          <td className="table-td text-xs font-medium">
                            <div>{review.planned_date}</div>
                            <div className="font-normal text-slate-400">{review.type}</div>
                          </td>
                          <td className="table-td text-xs">{learner.coach}</td>
                          <td className="table-td">
                            <span className={`badge ${review.status === "Completed" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                              {review.status}
                            </span>
                          </td>
                          <td className="table-td text-xs text-slate-500">{review.actual_date || "—"}</td>
                          <td className="table-td text-xs text-slate-400">kbc_users_data review slots</td>
                        </tr>
                      ))}
                      {reviews.length === 0 && (
                        <tr>
                          <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={5}>
                            No review slots found for this learner
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Notes & Timeline" && <LearnerTimeline events={timeline} />}

            {activeTab === "Evidence" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{learnerEvidence.length} document{learnerEvidence.length !== 1 ? "s" : ""} linked to this learner</p>
                  <button className="btn-primary flex items-center gap-1.5 text-xs">
                    <i className="ri-upload-cloud-2-line"></i> Upload Evidence
                  </button>
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                  <i className="ri-folder-open-line mb-2 block text-4xl text-slate-300"></i>
                  <p className="text-sm text-slate-400">No evidence linked to this learner yet</p>
                </div>
              </div>
            )}

            {activeTab === "Actions" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{learnerActions.length} action{learnerActions.length !== 1 ? "s" : ""} linked to this learner</p>
                  <button className="btn-primary flex items-center gap-1.5 text-xs">
                    <i className="ri-add-line"></i> Create Action
                  </button>
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                  <i className="ri-task-line mb-2 block text-4xl text-slate-300"></i>
                  <p className="text-sm text-slate-400">No actions for this learner</p>
                </div>
              </div>
            )}

            {activeTab === "Safeguarding" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
                  <i className="ri-lock-line text-2xl text-amber-500"></i>
                </div>
                <h3 className="text-base font-semibold text-slate-800">Restricted Access</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Safeguarding records for this learner are restricted to authorised Safeguarding Leads and Directors only. All access is logged.
                </p>
                <button className="btn-primary mt-5" onClick={() => navigate("/safeguarding")}>
                  View Safeguarding Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
