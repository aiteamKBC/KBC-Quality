import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DashboardCoachWorkload } from "@/types/dashboard";

interface Props {
  coaches: DashboardCoachWorkload[];
}

function workloadColor(score: number) {
  if (score >= 70) return { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", label: "High" };
  if (score >= 40) return { bar: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", label: "Medium" };
  return { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", label: "Low" };
}

export default function CoachWorkloadPanel({ coaches }: Props) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Coach Workload</h3>
          <p className="mt-0.5 text-xs text-slate-400">Live caseload, actions, review pressure and learner risk by coach</p>
        </div>
        <button onClick={() => navigate("/learners")} className="cursor-pointer whitespace-nowrap text-xs text-brand-600 hover:underline">
          View learners &rarr;
        </button>
      </div>

      {coaches.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">No coach workload data available</div>
      ) : (
        <>
          <div className="mb-1 grid grid-cols-[200px_1fr_80px_80px_80px_100px_110px] gap-3 border-b border-slate-100 px-3 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Coach</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Caseload RAG</span>
            <span className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Attend.</span>
            <span className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">OTJH</span>
            <span className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</span>
            <span className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Reviews Due</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Workload</span>
          </div>

          <div className="space-y-1">
            {coaches.map((coach) => {
              const wl = workloadColor(coach.workload_score);
              const isExpanded = expanded === coach.id;

              return (
                <div key={coach.id} className="overflow-hidden rounded-lg">
                  <div
                    onClick={() => setExpanded(isExpanded ? null : coach.id)}
                    className="group grid cursor-pointer grid-cols-[200px_1fr_80px_80px_80px_100px_110px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {coach.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{coach.name}</p>
                        <p className="text-xs text-slate-400">{coach.total_learners} learners</p>
                      </div>
                      <div className="ml-auto flex h-4 w-4 flex-shrink-0 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                        <i className={`${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-sm text-slate-400`}></i>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-5 flex-1 overflow-hidden rounded-md">
                        {coach.green_count > 0 && (
                          <div className="flex items-center justify-center bg-emerald-400 text-xs font-semibold text-white" style={{ width: `${(coach.green_count / coach.total_learners) * 100}%` }}>
                            {coach.green_count}
                          </div>
                        )}
                        {coach.amber_count > 0 && (
                          <div className="flex items-center justify-center bg-amber-400 text-xs font-semibold text-white" style={{ width: `${(coach.amber_count / coach.total_learners) * 100}%` }}>
                            {coach.amber_count}
                          </div>
                        )}
                        {coach.red_count > 0 && (
                          <div className="flex items-center justify-center bg-red-500 text-xs font-semibold text-white" style={{ width: `${(coach.red_count / coach.total_learners) * 100}%` }}>
                            {coach.red_count}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <span className={`text-sm font-semibold ${coach.avg_attendance >= 90 ? "text-emerald-600" : coach.avg_attendance >= 80 ? "text-amber-600" : "text-red-600"}`}>
                        {coach.avg_attendance}%
                      </span>
                    </div>

                    <div className="text-center">
                      <span className={`text-sm font-semibold ${coach.avg_otjh_pct >= 80 ? "text-emerald-600" : coach.avg_otjh_pct >= 65 ? "text-amber-600" : "text-red-600"}`}>
                        {coach.avg_otjh_pct}%
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-sm font-semibold text-slate-800">{coach.open_actions}</span>
                      {coach.critical_actions > 0 && <span className="text-xs font-medium text-red-600">{coach.critical_actions} critical</span>}
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-sm font-semibold ${coach.overdue_reviews > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {coach.overdue_reviews > 0 ? coach.overdue_reviews : "OK"}
                      </span>
                      {coach.next_review_due && <span className="text-xs text-slate-400">Next: {coach.next_review_due}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${wl.bar}`} style={{ width: `${Math.min(coach.workload_score, 100)}%` }}></div>
                      </div>
                      <span className={`whitespace-nowrap rounded-full border px-1.5 py-0.5 text-xs font-semibold ${wl.bg} ${wl.text} ${wl.border}`}>{wl.label}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mx-3 mb-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      <div className="divide-y divide-slate-100">
                        {coach.learners.map((learner) => (
                          <div
                            key={learner.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/learners/${learner.id}`);
                            }}
                            className="group/row flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white"
                          >
                            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${learner.rag_status === "Green" ? "bg-emerald-500" : learner.rag_status === "Amber" ? "bg-amber-400" : "bg-red-500"}`}></span>
                            <div className="w-40 flex-shrink-0">
                              <p className="truncate text-xs font-semibold text-slate-700 group-hover/row:text-brand-700">{learner.full_name}</p>
                              <p className="truncate text-xs text-slate-400">{learner.programme}</p>
                            </div>
                            <div className="flex min-w-0 flex-1 items-center gap-1.5">
                              <span className="w-16 flex-shrink-0 text-xs text-slate-400">Attend.</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                <div className={`h-full rounded-full ${learner.attendance_pct >= 90 ? "bg-emerald-400" : learner.attendance_pct >= 80 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${learner.attendance_pct}%` }}></div>
                              </div>
                              <span className="w-10 text-right text-xs font-semibold text-slate-700">{learner.attendance_pct}%</span>
                            </div>
                            <div className="flex min-w-0 flex-1 items-center gap-1.5">
                              <span className="w-10 flex-shrink-0 text-xs text-slate-400">OTJH</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                <div className={`h-full rounded-full ${learner.otjh_pct >= 80 ? "bg-emerald-400" : learner.otjh_pct >= 65 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${Math.min(learner.otjh_pct, 100)}%` }}></div>
                              </div>
                              <span className="w-10 text-right text-xs font-semibold text-slate-700">{learner.otjh_pct}%</span>
                            </div>
                            <div className="flex w-40 flex-shrink-0 justify-end gap-1 flex-wrap">
                              {learner.risk_flags.slice(0, 2).map((flag) => (
                                <span key={flag} className="whitespace-nowrap rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600">{flag}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {coach.actions.length > 0 && (
                        <div className="border-t border-slate-200 px-4 py-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Open Actions ({coach.actions.length})</p>
                          <div className="space-y-1.5">
                            {coach.actions.map((action) => (
                              <div
                                key={action.id}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  navigate("/actions");
                                }}
                                className="group/action flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white"
                              >
                                <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${action.priority === "Critical" ? "bg-red-500" : action.priority === "High" ? "bg-amber-400" : "bg-slate-300"}`}></span>
                                <span className="flex-1 truncate text-xs text-slate-600 group-hover/action:text-brand-700">{action.title}</span>
                                <span className="text-xs text-slate-400">{action.due_date || "No due date"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
