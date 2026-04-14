import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/feature/AppLayout';
import RagBadge from '@/components/base/RagBadge';
import LearnerAttendanceChart from './components/LearnerAttendanceChart';
import LearnerOTJHChart from './components/LearnerOTJHChart';
import LearnerProgressChart from './components/LearnerProgressChart';
import LearnerTimeline from './components/LearnerTimeline';
import { mockLearners } from '@/mocks/learners';
import { mockEvidence } from '@/mocks/evidence';
import { mockActions } from '@/mocks/actions';

const tabs = ['Overview', 'Attendance & OTJH', 'Progress Reviews', 'Notes & Timeline', 'Evidence', 'Actions', 'Safeguarding'];

const reviews = [
  { date: '2024-11-20', status: 'Completed', signed: true,  notes: 'Good progress. OTJH catch-up plan agreed with employer.' },
  { date: '2024-08-15', status: 'Completed', signed: true,  notes: 'On track. Employer feedback positive. Portfolio building well.' },
  { date: '2024-05-10', status: 'Completed', signed: true,  notes: 'Satisfactory progress. Initial EPA prep discussed.' },
  { date: '2025-02-20', status: 'Upcoming',  signed: false, notes: '' },
];

export default function LearnerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [aiExpanded, setAiExpanded] = useState(false);

  const learner = mockLearners.find((l) => l.id === id);

  if (!learner) return (
    <AppLayout title="Learner Not Found">
      <div className="text-center py-20 text-slate-400">
        <i className="ri-user-unfollow-line text-5xl text-slate-300 block mb-3"></i>
        <p className="text-lg font-medium text-slate-600">Learner not found</p>
        <button onClick={() => navigate('/learners')} className="btn-primary mt-4">
          <i className="ri-arrow-left-line mr-1"></i> Back to Learners
        </button>
      </div>
    </AppLayout>
  );

  const learnerEvidence = mockEvidence.filter((e) => e.linked_learner_id === id);
  const learnerActions = mockActions.filter((a) => a.linked_learner_id === id);
  const otjhPct = Math.round((learner.otjh_logged / learner.otjh_target) * 100);
  const otjhRemaining = learner.otjh_target - learner.otjh_logged;

  const attStatus = learner.attendance_pct >= 90 ? 'Green' : learner.attendance_pct >= 80 ? 'Amber' : 'Red';
  const otjhStatus = otjhPct >= 85 ? 'Green' : otjhPct >= 70 ? 'Amber' : 'Red';
  const progStatus = learner.progress >= 80 ? 'Green' : learner.progress >= 60 ? 'Amber' : 'Red';

  const priorityColor: Record<string, string> = {
    Critical: 'bg-red-50 text-red-700 border border-red-200',
    High: 'bg-amber-50 text-amber-700 border border-amber-200',
    Medium: 'bg-slate-100 text-slate-600',
    Low: 'bg-slate-50 text-slate-400',
  };

  return (
    <AppLayout title={learner.full_name}>
      <div className="space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <button onClick={() => navigate('/learners')} className="hover:text-brand-600 cursor-pointer transition-colors">
            Learners
          </button>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-slate-700 font-medium">{learner.full_name}</span>
        </div>

        {/* ── Profile Header Card ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Coloured top strip based on RAG */}
          <div className={`h-1.5 w-full ${learner.rag_status === 'Green' ? 'bg-emerald-500' : learner.rag_status === 'Amber' ? 'bg-amber-400' : 'bg-red-500'}`}></div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-brand-700 flex items-center justify-center text-white text-xl font-bold">
                  {learner.full_name.split(' ').map((n) => n[0]).join('')}
                </div>
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${learner.rag_status === 'Green' ? 'bg-emerald-500' : learner.rag_status === 'Amber' ? 'bg-amber-400' : 'bg-red-500'}`}></span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{learner.full_name}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{learner.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 ml-auto">
                    <RagBadge status={learner.rag_status} size="md" />
                    {learner.risk_flags.map((f) => (
                      <span key={f} className="badge bg-red-50 text-red-600 border border-red-200 text-xs">
                        <i className="ri-alarm-warning-line mr-1"></i>{f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {[
                    { icon: 'ri-book-open-line',     label: 'Programme',    value: learner.programme },
                    { icon: 'ri-building-2-line',    label: 'Employer',     value: learner.employer },
                    { icon: 'ri-user-3-line',        label: 'Coach',        value: learner.coach },
                    { icon: 'ri-group-line',         label: 'Cohort',       value: learner.cohort },
                    { icon: 'ri-calendar-line',      label: 'Start Date',   value: learner.start_date },
                    { icon: 'ri-calendar-check-line',label: 'Expected End', value: learner.expected_end_date },
                    { icon: 'ri-time-line',          label: 'Last Review',  value: learner.last_review },
                    { icon: 'ri-calendar-event-line',label: 'Next Review',  value: learner.next_review },
                  ].map((f) => (
                    <div key={f.label} className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className={`${f.icon} text-slate-400 text-xs`}></i>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">{f.label}</div>
                        <div className="text-xs font-semibold text-slate-800 mt-0.5">{f.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
              {[
                { label: 'Attendance', value: `${learner.attendance_pct}%`, status: attStatus, icon: 'ri-calendar-check-line', sub: learner.attendance_pct >= 90 ? 'On target' : 'Below 90% target' },
                { label: 'OTJH Progress', value: `${otjhPct}%`, status: otjhStatus, icon: 'ri-timer-line', sub: `${learner.otjh_logged}h of ${learner.otjh_target}h` },
                { label: 'Overall Progress', value: `${learner.progress}%`, status: progStatus, icon: 'ri-bar-chart-line', sub: 'Portfolio & assessments' },
                { label: 'Next Review', value: learner.next_review, status: 'neutral', icon: 'ri-calendar-event-line', sub: 'Scheduled' },
              ].map((k) => (
                <div key={k.label} className={`rounded-lg p-3.5 border ${k.status === 'Green' ? 'bg-emerald-50 border-emerald-100' : k.status === 'Amber' ? 'bg-amber-50 border-amber-100' : k.status === 'Red' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <i className={`${k.icon} text-sm ${k.status === 'Green' ? 'text-emerald-500' : k.status === 'Amber' ? 'text-amber-500' : k.status === 'Red' ? 'text-red-500' : 'text-slate-400'}`}></i>
                    <span className="text-xs text-slate-500">{k.label}</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{k.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{k.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 flex overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`tab-item flex-shrink-0 ${activeTab === t ? 'tab-active' : 'tab-inactive'}`}
              >
                {t === 'Evidence' && learnerEvidence.length > 0 && (
                  <span className="ml-1 badge bg-brand-100 text-brand-600 text-xs py-0">{learnerEvidence.length}</span>
                )}
                {t === 'Actions' && learnerActions.length > 0 && (
                  <span className="ml-1 badge bg-red-100 text-red-600 text-xs py-0">{learnerActions.length}</span>
                )}
                {t !== 'Evidence' && t !== 'Actions' && t}
                {t === 'Evidence' && 'Evidence'}
                {t === 'Actions' && 'Actions'}
              </button>
            ))}
          </div>

          <div className="p-5">

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'Overview' && (
              <div className="space-y-5">
                {/* AI Summary */}
                <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-slate-50 overflow-hidden">
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                        <i className="ri-sparkling-line text-white text-xs"></i>
                      </div>
                      <span className="text-sm font-semibold text-brand-900">AI-Generated Summary</span>
                      <span className="badge bg-brand-100 text-brand-600 text-xs">Auto-updated</span>
                    </div>
                    <button onClick={() => setAiExpanded(!aiExpanded)} className="text-xs text-brand-600 hover:underline cursor-pointer">
                      {aiExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  <div className="px-5 pb-4">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {learner.rag_status === 'Red' && (
                        <><strong className="text-red-600">{learner.full_name} requires urgent attention.</strong> Attendance has dropped to {learner.attendance_pct}% (below the 80% threshold) and OTJH is critically low at {otjhPct}% of the {learner.otjh_target}h target — only {learner.otjh_logged}h logged to date. Multiple risk flags are active. A formal intervention plan has been initiated with the employer.</>
                      )}
                      {learner.rag_status === 'Amber' && (
                        <><strong className="text-amber-700">{learner.full_name} is making solid progress overall</strong> but requires monitoring. Attendance is {learner.attendance_pct}% — within acceptable range. The primary concern is OTJH, currently at {otjhPct}% of the {learner.otjh_target}h target ({learner.otjh_logged}h logged, {otjhRemaining}h remaining). A catch-up plan has been agreed with the learner and employer. Progress reviews are up to date. No safeguarding concerns identified.</>
                      )}
                      {learner.rag_status === 'Green' && (
                        <><strong className="text-emerald-700">{learner.full_name} is performing excellently.</strong> Attendance is {learner.attendance_pct}%, OTJH is on track at {otjhPct}% ({learner.otjh_logged}h logged of {learner.otjh_target}h target), and overall portfolio progress stands at {learner.progress}%. Progress reviews are completed and up to date. No risks or concerns at this time. On track for timely completion.</>
                      )}
                    </p>
                    {aiExpanded && (
                      <div className="mt-3 pt-3 border-t border-brand-100 grid grid-cols-3 gap-3">
                        {[
                          { label: 'Strengths', items: ['Consistent engagement', 'Positive employer relationship', 'Portfolio quality strong'], color: 'text-emerald-700 bg-emerald-50' },
                          { label: 'Areas to Watch', items: learner.risk_flags.length > 0 ? learner.risk_flags : ['Monitor OTJH monthly', 'Ensure next review is scheduled'], color: 'text-amber-700 bg-amber-50' },
                          { label: 'Recommended Actions', items: ['Schedule next progress review', 'Log OTJH with employer', 'Upload evidence to vault'], color: 'text-brand-700 bg-brand-50' },
                        ].map((section) => (
                          <div key={section.label} className={`rounded-lg p-3 ${section.color.split(' ')[1]}`}>
                            <p className={`text-xs font-semibold mb-2 ${section.color.split(' ')[0]}`}>{section.label}</p>
                            <ul className="space-y-1">
                              {section.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                                  <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Risk flags + quick stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <i className="ri-alarm-warning-line text-slate-400"></i> Risk Flags
                    </h3>
                    {learner.risk_flags.length === 0 ? (
                      <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <i className="ri-checkbox-circle-line text-emerald-500 text-lg"></i>
                        <div>
                          <p className="text-sm font-medium text-emerald-800">No active risk flags</p>
                          <p className="text-xs text-emerald-600">This learner has no concerns at this time</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {learner.risk_flags.map((f) => (
                          <div key={f} className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <i className="ri-alarm-warning-line text-red-500 mt-0.5"></i>
                            <div>
                              <p className="text-sm font-medium text-red-800">{f}</p>
                              <p className="text-xs text-red-500">Requires immediate attention</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <i className="ri-bar-chart-line text-slate-400"></i> Quick Stats
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Attendance', value: learner.attendance_pct, unit: '%', target: 90, color: attStatus === 'Green' ? '#10b981' : attStatus === 'Amber' ? '#f59e0b' : '#ef4444' },
                        { label: 'OTJH Progress', value: otjhPct, unit: '%', target: 100, color: otjhStatus === 'Green' ? '#10b981' : otjhStatus === 'Amber' ? '#f59e0b' : '#ef4444' },
                        { label: 'Portfolio Progress', value: learner.progress, unit: '%', target: 100, color: progStatus === 'Green' ? '#10b981' : progStatus === 'Amber' ? '#f59e0b' : '#ef4444' },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">{s.label}</span>
                            <span className="text-xs font-bold text-slate-800">{s.value}{s.unit}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(s.value, 100)}%`, backgroundColor: s.color }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent activity preview */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
                    <button onClick={() => setActiveTab('Notes & Timeline')} className="text-xs text-brand-600 hover:underline cursor-pointer">
                      Full timeline &rarr;
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { type: 'Review', text: 'Q4 Progress Review completed — OTJH plan agreed', date: '2024-11-28', icon: 'ri-clipboard-line', color: 'text-brand-500 bg-brand-50' },
                      { type: 'Note', text: 'Coaching session: EPA preparation discussed', date: '2024-11-10', icon: 'ri-sticky-note-line', color: 'text-slate-500 bg-slate-100' },
                      { type: 'Upload', text: 'Evidence uploaded: Progress Review Oct 2024', date: '2024-10-30', icon: 'ri-upload-cloud-2-line', color: 'text-emerald-500 bg-emerald-50' },
                    ].map((ev, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${ev.color.split(' ')[1]}`}>
                          <i className={`${ev.icon} ${ev.color.split(' ')[0]} text-xs`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-700">{ev.text}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{ev.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── ATTENDANCE & OTJH TAB ── */}
            {activeTab === 'Attendance & OTJH' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Attendance card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">Attendance Record</h3>
                        <p className="text-xs text-slate-400">Monthly attendance vs 90% target</p>
                      </div>
                      <RagBadge status={attStatus} />
                    </div>
                    <LearnerAttendanceChart attendancePct={learner.attendance_pct} />
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                      {[
                        { label: 'Overall', value: `${learner.attendance_pct}%`, color: attStatus === 'Green' ? 'text-emerald-600' : attStatus === 'Amber' ? 'text-amber-600' : 'text-red-600' },
                        { label: 'Sessions Attended', value: '47', color: 'text-slate-800' },
                        { label: 'Sessions Missed', value: learner.attendance_pct >= 90 ? '2' : learner.attendance_pct >= 80 ? '5' : '12', color: 'text-slate-800' },
                      ].map((s) => (
                        <div key={s.label} className="text-center bg-slate-50 rounded-lg p-2.5">
                          <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                          <div className="text-xs text-slate-400">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OTJH card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">Off-the-Job Hours (OTJH)</h3>
                        <p className="text-xs text-slate-400">Monthly hours logged vs monthly target</p>
                      </div>
                      <RagBadge status={otjhStatus} />
                    </div>
                    <LearnerOTJHChart logged={learner.otjh_logged} target={learner.otjh_target} />
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                      {[
                        { label: 'Logged', value: `${learner.otjh_logged}h`, color: 'text-brand-600' },
                        { label: 'Target', value: `${learner.otjh_target}h`, color: 'text-slate-800' },
                        { label: 'Remaining', value: `${Math.max(0, otjhRemaining)}h`, color: otjhRemaining > 0 ? 'text-amber-600' : 'text-emerald-600' },
                      ].map((s) => (
                        <div key={s.label} className="text-center bg-slate-50 rounded-lg p-2.5">
                          <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                          <div className="text-xs text-slate-400">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Portfolio progress chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Portfolio &amp; Programme Progress</h3>
                      <p className="text-xs text-slate-400">Actual progress vs expected trajectory</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded"></span> Actual</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-200 inline-block rounded"></span> Expected</span>
                    </div>
                  </div>
                  <LearnerProgressChart progress={learner.progress} />
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span>Current: <strong className="text-slate-800">{learner.progress}%</strong></span>
                    <RagBadge status={progStatus} />
                  </div>
                </div>
              </div>
            )}

            {/* ── PROGRESS REVIEWS TAB ── */}
            {activeTab === 'Progress Reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-3 gap-3 flex-1">
                    {[
                      { label: 'Completed', count: reviews.filter(r => r.status === 'Completed').length, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                      { label: 'Upcoming', count: reviews.filter(r => r.status === 'Upcoming').length, color: 'text-brand-600 bg-brand-50 border-brand-100' },
                      { label: 'Unsigned', count: reviews.filter(r => r.status === 'Completed' && !r.signed).length, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                    ].map((s) => (
                      <div key={s.label} className={`rounded-lg border p-3 text-center ${s.color}`}>
                        <div className="text-xl font-bold">{s.count}</div>
                        <div className="text-xs font-medium mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary text-xs ml-4 flex-shrink-0">
                    <i className="ri-add-line mr-1"></i> Schedule Review
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="table-th">Date</th>
                        <th className="table-th">Coach</th>
                        <th className="table-th">Status</th>
                        <th className="table-th">Signed</th>
                        <th className="table-th">Notes</th>
                        <th className="table-th"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((r, i) => (
                        <tr key={i} className="table-row">
                          <td className="table-td font-medium text-xs">{r.date}</td>
                          <td className="table-td text-xs">{learner.coach}</td>
                          <td className="table-td">
                            <span className={`badge ${r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : r.status === 'Overdue' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="table-td">
                            {r.status === 'Completed' && (
                              r.signed
                                ? <span className="flex items-center gap-1 text-emerald-600 text-xs"><i className="ri-check-line"></i> Signed</span>
                                : <span className="flex items-center gap-1 text-amber-600 text-xs"><i className="ri-time-line"></i> Pending</span>
                            )}
                            {r.status === 'Upcoming' && <span className="text-xs text-slate-400">—</span>}
                          </td>
                          <td className="table-td text-xs text-slate-500 max-w-xs">{r.notes || '—'}</td>
                          <td className="table-td">
                            {r.status === 'Completed' && (
                              <button className="btn-ghost text-xs py-1 px-2">
                                <i className="ri-eye-line mr-1"></i> View
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── NOTES & TIMELINE TAB ── */}
            {activeTab === 'Notes & Timeline' && (
              <LearnerTimeline learnerName={learner.full_name} coachName={learner.coach} />
            )}

            {/* ── EVIDENCE TAB ── */}
            {activeTab === 'Evidence' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{learnerEvidence.length} document{learnerEvidence.length !== 1 ? 's' : ''} linked to this learner</p>
                  <button className="btn-primary text-xs flex items-center gap-1.5">
                    <i className="ri-upload-cloud-2-line"></i> Upload Evidence
                  </button>
                </div>
                {learnerEvidence.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <i className="ri-folder-open-line text-4xl text-slate-300 block mb-2"></i>
                    <p className="text-sm text-slate-400">No evidence linked to this learner yet</p>
                    <button className="btn-primary mt-3 text-xs">Upload first document</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {learnerEvidence.map((ev) => (
                      <div key={ev.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-slate-50 transition-all cursor-pointer">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ev.file_type === 'PDF' ? 'bg-red-50 text-red-500' : ev.file_type === 'DOCX' ? 'bg-brand-50 text-brand-500' : 'bg-emerald-50 text-emerald-500'}`}>
                          <i className="ri-file-3-line text-base"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800">{ev.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{ev.category} &middot; {ev.inspection_theme} &middot; {ev.uploaded_by} &middot; {ev.created_at}</div>
                          <div className="flex gap-1 mt-1.5">{ev.tags.map((t) => <span key={t} className="badge bg-slate-100 text-slate-500 text-xs">{t}</span>)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`badge ${ev.review_status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{ev.review_status}</span>
                          <span className="text-xs text-slate-400">{ev.file_type} &middot; {ev.file_size}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ACTIONS TAB ── */}
            {activeTab === 'Actions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{learnerActions.length} action{learnerActions.length !== 1 ? 's' : ''} linked to this learner</p>
                  <button className="btn-primary text-xs flex items-center gap-1.5">
                    <i className="ri-add-line"></i> Create Action
                  </button>
                </div>
                {learnerActions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <i className="ri-task-line text-4xl text-slate-300 block mb-2"></i>
                    <p className="text-sm text-slate-400">No actions for this learner</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {learnerActions.map((a) => {
                      const isOverdue = new Date(a.due_date) < new Date('2024-12-01') && a.status !== 'Completed';
                      return (
                        <div key={a.id} className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                          <div className="flex items-start gap-3">
                            <span className={`badge mt-0.5 flex-shrink-0 ${priorityColor[a.priority]}`}>{a.priority}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800">{a.title}</p>
                              <p className="text-xs text-slate-400 mt-1">{a.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                <span><i className="ri-user-line mr-1"></i>{a.owner}</span>
                                <span className={`flex items-center gap-0.5 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                                  {isOverdue && <i className="ri-alarm-warning-line"></i>}
                                  <i className="ri-calendar-line mr-0.5"></i>{a.due_date}
                                </span>
                                <span className="badge bg-slate-100 text-slate-600">{a.status}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── SAFEGUARDING TAB ── */}
            {activeTab === 'Safeguarding' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                  <i className="ri-lock-line text-amber-500 text-2xl"></i>
                </div>
                <h3 className="text-base font-semibold text-slate-800">Restricted Access</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  Safeguarding records for this learner are restricted to authorised Safeguarding Leads and Directors only. All access is logged.
                </p>
                <button className="btn-primary mt-5" onClick={() => navigate('/safeguarding')}>
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
