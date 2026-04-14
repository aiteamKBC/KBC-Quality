import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockLearners } from '@/mocks/learners';
import { mockActions } from '@/mocks/actions';

interface CoachStat {
  id: string;
  name: string;
  initials: string;
  role: string;
  totalLearners: number;
  greenCount: number;
  amberCount: number;
  redCount: number;
  openActions: number;
  criticalActions: number;
  overdueReviews: number;
  nextReviewDue: string | null;
  avgAttendance: number;
  avgOtjhPct: number;
  workloadScore: number; // 0-100, higher = more stressed
}

const TODAY = new Date('2025-01-01');

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('');
}

function workloadColor(score: number) {
  if (score >= 70) return { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'High' };
  if (score >= 40) return { bar: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Medium' };
  return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Low' };
}

export default function CoachWorkloadPanel() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const coachStats: CoachStat[] = useMemo(() => {
    const coachNames = [...new Set(mockLearners.map((l) => l.coach))];

    return coachNames.map((coachName) => {
      const myLearners = mockLearners.filter((l) => l.coach === coachName);
      const myActions = mockActions.filter(
        (a) => a.owner === coachName && a.status !== 'Completed'
      );

      const overdueReviews = myLearners.filter(
        (l) => l.next_review && new Date(l.next_review) < TODAY
      ).length;

      const avgAttendance =
        myLearners.length > 0
          ? Math.round(myLearners.reduce((s, l) => s + l.attendance_pct, 0) / myLearners.length)
          : 0;

      const avgOtjhPct =
        myLearners.length > 0
          ? Math.round(
              myLearners.reduce((s, l) => s + (l.otjh_logged / l.otjh_target) * 100, 0) /
                myLearners.length
            )
          : 0;

      const criticalActions = myActions.filter((a) => a.priority === 'Critical').length;
      const overdueActions = myActions.filter(
        (a) => new Date(a.due_date) < TODAY
      ).length;

      const nextReviewDates = myLearners
        .filter((l) => l.next_review && new Date(l.next_review) >= TODAY)
        .map((l) => l.next_review)
        .sort();
      const nextReviewDue = nextReviewDates[0] ?? null;

      // Workload score: weighted composite
      const score = Math.min(
        100,
        Math.round(
          myLearners.filter((l) => l.rag_status !== 'Green').length * 8 +
            overdueReviews * 12 +
            myActions.length * 5 +
            criticalActions * 15 +
            overdueActions * 10
        )
      );

      // find initials + role from learners data (coach field only has name)
      const coachId = mockLearners.find((l) => l.coach === coachName)?.coach_id ?? '';

      return {
        id: coachId,
        name: coachName,
        initials: initials(coachName),
        role: 'Coach / Assessor',
        totalLearners: myLearners.length,
        greenCount: myLearners.filter((l) => l.rag_status === 'Green').length,
        amberCount: myLearners.filter((l) => l.rag_status === 'Amber').length,
        redCount: myLearners.filter((l) => l.rag_status === 'Red').length,
        openActions: myActions.length,
        criticalActions,
        overdueReviews,
        nextReviewDue,
        avgAttendance,
        avgOtjhPct,
        workloadScore: score,
      };
    }).sort((a, b) => b.workloadScore - a.workloadScore);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Coach Workload</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Caseload, open actions &amp; overdue reviews per staff member
          </p>
        </div>
        <button
          onClick={() => navigate('/learners')}
          className="text-xs text-brand-600 hover:underline cursor-pointer whitespace-nowrap"
        >
          View learners &rarr;
        </button>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[200px_1fr_80px_80px_80px_100px_110px] gap-3 px-3 pb-2 border-b border-slate-100 mb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Coach</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Caseload RAG</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Attend.</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">OTJH</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Actions</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Reviews Due</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Workload</span>
      </div>

      <div className="space-y-1">
        {coachStats.map((coach) => {
          const wl = workloadColor(coach.workloadScore);
          const isExpanded = expanded === coach.id;
          const myLearners = mockLearners.filter((l) => l.coach === coach.name);
          const myActions = mockActions.filter(
            (a) => a.owner === coach.name && a.status !== 'Completed'
          );

          return (
            <div key={coach.id} className="rounded-lg overflow-hidden">
              {/* Main row */}
              <div
                onClick={() => setExpanded(isExpanded ? null : coach.id)}
                className="grid grid-cols-[200px_1fr_80px_80px_80px_100px_110px] gap-3 px-3 py-3 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors items-center group"
              >
                {/* Coach name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {coach.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{coach.name}</p>
                    <p className="text-xs text-slate-400">{coach.totalLearners} learners</p>
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {isExpanded
                      ? <i className="ri-arrow-up-s-line text-slate-400 text-sm"></i>
                      : <i className="ri-arrow-down-s-line text-slate-400 text-sm"></i>
                    }
                  </div>
                </div>

                {/* RAG mini bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex h-5 rounded-md overflow-hidden">
                    {coach.greenCount > 0 && (
                      <div
                        title={`${coach.greenCount} Green`}
                        className="bg-emerald-400 flex items-center justify-center text-white text-xs font-semibold transition-all"
                        style={{ width: `${(coach.greenCount / coach.totalLearners) * 100}%` }}
                      >
                        {coach.greenCount}
                      </div>
                    )}
                    {coach.amberCount > 0 && (
                      <div
                        title={`${coach.amberCount} Amber`}
                        className="bg-amber-400 flex items-center justify-center text-white text-xs font-semibold transition-all"
                        style={{ width: `${(coach.amberCount / coach.totalLearners) * 100}%` }}
                      >
                        {coach.amberCount}
                      </div>
                    )}
                    {coach.redCount > 0 && (
                      <div
                        title={`${coach.redCount} Red`}
                        className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold transition-all"
                        style={{ width: `${(coach.redCount / coach.totalLearners) * 100}%` }}
                      >
                        {coach.redCount}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {coach.redCount > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-red-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{coach.redCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Avg Attendance */}
                <div className="text-center">
                  <span className={`text-sm font-semibold ${
                    coach.avgAttendance >= 90 ? 'text-emerald-600' :
                    coach.avgAttendance >= 80 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {coach.avgAttendance}%
                  </span>
                </div>

                {/* Avg OTJH */}
                <div className="text-center">
                  <span className={`text-sm font-semibold ${
                    coach.avgOtjhPct >= 80 ? 'text-emerald-600' :
                    coach.avgOtjhPct >= 65 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {coach.avgOtjhPct}%
                  </span>
                </div>

                {/* Open Actions */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-semibold text-slate-800">{coach.openActions}</span>
                  {coach.criticalActions > 0 && (
                    <span className="text-xs text-red-600 font-medium flex items-center gap-0.5">
                      <i className="ri-error-warning-line text-xs"></i>{coach.criticalActions} critical
                    </span>
                  )}
                </div>

                {/* Overdue Reviews */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className={`text-sm font-semibold ${coach.overdueReviews > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                    {coach.overdueReviews > 0 ? (
                      <span className="flex items-center gap-1">
                        <i className="ri-alarm-warning-line text-xs"></i>{coach.overdueReviews}
                      </span>
                    ) : (
                      <span className="text-emerald-600">✓</span>
                    )}
                  </span>
                  {coach.nextReviewDue && (
                    <span className="text-xs text-slate-400">Next: {coach.nextReviewDue}</span>
                  )}
                </div>

                {/* Workload score */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${wl.bar}`}
                      style={{ width: `${Math.min(coach.workloadScore, 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${wl.bg} ${wl.text} ${wl.border} border whitespace-nowrap`}>
                    {wl.label}
                  </span>
                </div>
              </div>

              {/* Expanded learner breakdown */}
              {isExpanded && (
                <div className="mx-3 mb-3 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                  {/* Learner rows */}
                  <div className="divide-y divide-slate-100">
                    {myLearners.map((l) => {
                      const isOverdueReview = l.next_review && new Date(l.next_review) < TODAY;
                      const otjhPct = Math.round((l.otjh_logged / l.otjh_target) * 100);
                      return (
                        <div
                          key={l.id}
                          onClick={(e) => { e.stopPropagation(); navigate(`/learners/${l.id}`); }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white cursor-pointer transition-colors group/row"
                        >
                          {/* RAG dot */}
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            l.rag_status === 'Green' ? 'bg-emerald-500' :
                            l.rag_status === 'Amber' ? 'bg-amber-400' : 'bg-red-500'
                          }`}></span>

                          {/* Name */}
                          <div className="w-36 flex-shrink-0">
                            <p className="text-xs font-semibold text-slate-700 group-hover/row:text-brand-700 truncate">{l.full_name}</p>
                            <p className="text-xs text-slate-400 truncate">{l.programme.replace('L3 ', '').replace('L2 ', '').replace('L4 ', '')}</p>
                          </div>

                          {/* Attendance mini bar */}
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="text-xs text-slate-400 w-16 flex-shrink-0">Attend.</span>
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${l.attendance_pct >= 90 ? 'bg-emerald-400' : l.attendance_pct >= 80 ? 'bg-amber-400' : 'bg-red-500'}`}
                                style={{ width: `${l.attendance_pct}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-semibold w-8 text-right ${l.attendance_pct >= 90 ? 'text-emerald-600' : l.attendance_pct >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                              {l.attendance_pct}%
                            </span>
                          </div>

                          {/* OTJH mini bar */}
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="text-xs text-slate-400 w-8 flex-shrink-0">OTJH</span>
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${otjhPct >= 80 ? 'bg-emerald-400' : otjhPct >= 65 ? 'bg-amber-400' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(otjhPct, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-semibold w-8 text-right ${otjhPct >= 80 ? 'text-emerald-600' : otjhPct >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                              {otjhPct}%
                            </span>
                          </div>

                          {/* Next review */}
                          <div className="w-28 flex-shrink-0 text-right">
                            {isOverdueReview ? (
                              <span className="text-xs text-red-600 font-semibold flex items-center justify-end gap-1">
                                <i className="ri-alarm-warning-line text-xs"></i> Overdue
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">{l.next_review}</span>
                            )}
                          </div>

                          {/* Flags */}
                          <div className="flex gap-1 w-32 flex-shrink-0 justify-end flex-wrap">
                            {l.risk_flags.slice(0, 2).map((flag) => (
                              <span key={flag} className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600 whitespace-nowrap">
                                {flag}
                              </span>
                            ))}
                          </div>

                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <i className="ri-arrow-right-line text-brand-400 text-xs"></i>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded actions */}
                  {myActions.length > 0 && (
                    <div className="border-t border-slate-200 px-4 py-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Open Actions ({myActions.length})
                      </p>
                      <div className="space-y-1.5">
                        {myActions.slice(0, 3).map((a) => (
                          <div
                            key={a.id}
                            onClick={(e) => { e.stopPropagation(); navigate('/actions'); }}
                            className="flex items-center gap-2.5 cursor-pointer hover:bg-white rounded-lg px-2 py-1.5 transition-colors group/action"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              a.priority === 'Critical' ? 'bg-red-500' :
                              a.priority === 'High' ? 'bg-amber-400' : 'bg-slate-300'
                            }`}></span>
                            <span className="text-xs text-slate-600 flex-1 truncate group-hover/action:text-brand-700">{a.title}</span>
                            <span className={`text-xs flex-shrink-0 ${
                              new Date(a.due_date) < TODAY ? 'text-red-500 font-medium' : 'text-slate-400'
                            }`}>{a.due_date}</span>
                          </div>
                        ))}
                        {myActions.length > 3 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate('/actions'); }}
                            className="text-xs text-brand-600 hover:underline cursor-pointer ml-4"
                          >
                            +{myActions.length - 3} more actions &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-4 gap-3">
        {[
          {
            label: 'Total Learners',
            value: mockLearners.length,
            icon: 'ri-user-3-line',
            color: 'text-slate-700',
          },
          {
            label: 'At Risk',
            value: mockLearners.filter((l) => l.rag_status !== 'Green').length,
            icon: 'ri-error-warning-line',
            color: 'text-amber-600',
          },
          {
            label: 'Overdue Reviews',
            value: mockLearners.filter((l) => l.next_review && new Date(l.next_review) < TODAY).length,
            icon: 'ri-alarm-warning-line',
            color: 'text-red-600',
          },
          {
            label: 'Open Actions',
            value: mockActions.filter((a) => a.status !== 'Completed').length,
            icon: 'ri-task-line',
            color: 'text-brand-600',
          },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-3 py-2.5">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <i className={`${s.icon} text-base ${s.color}`}></i>
            </div>
            <div>
              <p className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
