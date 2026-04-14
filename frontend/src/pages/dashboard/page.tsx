import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/feature/AppLayout';
import CustomSelect from '@/components/base/CustomSelect';
import KpiCard from '@/components/base/KpiCard';
import RagBadge from '@/components/base/RagBadge';
import AttendanceChart from './components/AttendanceChart';
import OTJHChart from './components/OTJHChart';
import RagDonutChart from './components/RagDonutChart';
import OfstedRadarChart from './components/OfstedRadarChart';
import ProgrammeBarChart from './components/ProgrammeBarChart';
import CoachWorkloadPanel from './components/CoachWorkloadPanel';
import { mockKPIs, mockAlerts, mockOfstedThemes, mockSafeguardingCases } from '@/mocks/dashboard';
import { mockActions } from '@/mocks/actions';
import { mockLearners } from '@/mocks/learners';

const programmeOptions = [
  { value: 'All', label: 'All Programmes', icon: 'ri-book-open-line' },
  { value: 'L3 Business Administration', label: 'L3 Business Administration', icon: 'ri-graduation-cap-line' },
  { value: 'L2 Customer Service', label: 'L2 Customer Service', icon: 'ri-graduation-cap-line' },
  { value: 'L3 Team Leader', label: 'L3 Team Leader', icon: 'ri-graduation-cap-line' },
  { value: 'L4 Project Management', label: 'L4 Project Management', icon: 'ri-graduation-cap-line' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [programme, setProgramme] = useState('All');
  const recentActions = mockActions.slice(0, 5);
  const atRiskLearners = mockLearners.filter((l) => l.rag_status === 'Red' || l.rag_status === 'Amber').slice(0, 5);
  const redAlerts = mockAlerts.filter((a) => a.severity === 'Red');
  const amberAlerts = mockAlerts.filter((a) => a.severity === 'Amber');

  return (
    <AppLayout title="Executive Dashboard">
      <div className="space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Executive Dashboard</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              KBC quality, compliance &amp; inspection readiness &mdash; December 2024
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CustomSelect
              value={programme}
              onChange={setProgramme}
              options={programmeOptions}
              className="w-56"
            />
            <button className="btn-secondary flex items-center gap-1.5">
              <i className="ri-refresh-line text-xs"></i> Refresh
            </button>
            <button className="btn-primary flex items-center gap-1.5">
              <i className="ri-download-2-line text-xs"></i> Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard title="Active Learners" value={mockKPIs.activeLearners.value} trend={mockKPIs.activeLearners.trend} trendUp status="Green" icon="ri-user-3-line" />
          <KpiCard title="Avg Attendance" value={`${mockKPIs.avgAttendance.value}`} trend={mockKPIs.avgAttendance.trend} trendUp={false} status="Amber" icon="ri-calendar-check-line" suffix="%" />
          <KpiCard title="OTJH Compliance" value={`${mockKPIs.otjhCompliance.value}`} trend={mockKPIs.otjhCompliance.trend} trendUp={false} status="Amber" icon="ri-timer-line" suffix="%" />
          <KpiCard title="Overdue Reviews" value={mockKPIs.overdueReviews.value} trend={mockKPIs.overdueReviews.trend} trendUp={false} status="Red" icon="ri-alarm-warning-line" />
          <KpiCard title="Open Actions" value={mockKPIs.openActions.value} trend={mockKPIs.openActions.trend} trendUp={false} status="Amber" icon="ri-task-line" />
          <KpiCard title="Safeguarding Alerts" value={mockKPIs.safeguardingAlerts.value} trend={mockKPIs.safeguardingAlerts.trend} status="Amber" icon="ri-heart-pulse-line" />
          <KpiCard title="Ofsted Readiness" value={`${mockKPIs.ofstedReadiness.value}`} trend={mockKPIs.ofstedReadiness.trend} trendUp status="Amber" icon="ri-shield-star-line" suffix="%" />
          <KpiCard title="Employer Engagement" value={`${mockKPIs.employerEngagement.value}`} trend={mockKPIs.employerEngagement.trend} trendUp status="Green" icon="ri-building-2-line" suffix="%" />
        </div>

        {/* Alerts Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <i className="ri-alarm-warning-line text-red-500"></i>
            <span className="text-sm font-semibold text-red-800">
              {redAlerts.length} critical alerts &middot; {amberAlerts.length} warnings require attention
            </span>
            <button onClick={() => navigate('/learners')} className="ml-auto text-xs text-red-700 hover:underline cursor-pointer font-medium whitespace-nowrap">
              View all &rarr;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {mockAlerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 bg-white/60 rounded-md px-3 py-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.severity === 'Red' ? 'bg-red-500' : 'bg-amber-400'}`}></span>
                <span className={`text-xs font-semibold w-28 flex-shrink-0 ${alert.severity === 'Red' ? 'text-red-700' : 'text-amber-700'}`}>
                  {alert.type}
                </span>
                <span className="text-xs text-slate-600 truncate">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Charts row 1: Attendance + OTJH + RAG Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Attendance trend */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Attendance Trend</h3>
                <p className="text-xs text-slate-400">vs 90% target &middot; last 6 months</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-amber-400 inline-block rounded"></span> Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-slate-200 inline-block rounded border-dashed"></span> Target
                </span>
              </div>
            </div>
            <AttendanceChart />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
              <span className="text-xs text-slate-400">Current: <span className="font-semibold text-slate-700">88.9%</span></span>
              <span className="badge bg-amber-50 text-amber-700 border border-amber-200">-1.1% vs target</span>
            </div>
          </div>

          {/* OTJH trend */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">OTJH Compliance</h3>
                <p className="text-xs text-slate-400">vs 80% target &middot; last 6 months</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-brand-400 inline-block rounded"></span> Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-slate-200 inline-block rounded"></span> Target
                </span>
              </div>
            </div>
            <OTJHChart />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
              <span className="text-xs text-slate-400">Current: <span className="font-semibold text-slate-700">71%</span></span>
              <span className="badge bg-red-50 text-red-700 border border-red-200">-9% vs target</span>
            </div>
          </div>

          {/* RAG Donut */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Learner RAG Status</h3>
                <p className="text-xs text-slate-400">Current cohort breakdown</p>
              </div>
            </div>
            <RagDonutChart />
          </div>
        </div>

        {/* Charts row 2: Programme comparison + Ofsted radar */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Programme bar chart */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Programme Performance</h3>
                <p className="text-xs text-slate-400">Attendance &amp; OTJH % by programme</p>
              </div>
              <button onClick={() => navigate('/learners')} className="text-xs text-brand-600 hover:underline cursor-pointer">
                Learner detail &rarr;
              </button>
            </div>
            <ProgrammeBarChart />
          </div>

          {/* Ofsted radar */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Ofsted Readiness</h3>
                <p className="text-xs text-slate-400">Score by inspection theme</p>
              </div>
              <button onClick={() => navigate('/ofsted')} className="text-xs text-brand-600 hover:underline cursor-pointer">
                Full report &rarr;
              </button>
            </div>
            <OfstedRadarChart />
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 -mt-2">
              {[
                { label: 'Strong (80%+)', color: 'bg-emerald-500' },
                { label: 'Developing (65-79%)', color: 'bg-amber-400' },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${l.color}`}></span>{l.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ofsted Theme Cards */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Ofsted Readiness by Theme</h3>
              <p className="text-xs text-slate-400">Overall readiness score: 74% &mdash; Amber</p>
            </div>
            <button onClick={() => navigate('/ofsted')} className="btn-secondary text-xs">Full Report &rarr;</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mockOfstedThemes.map((t) => (
              <div key={t.theme} className="border border-slate-100 rounded-lg p-3 hover:border-slate-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-slate-700 leading-tight">{t.theme}</span>
                  <RagBadge status={t.status} />
                </div>
                <div className="flex items-end justify-between mb-1.5">
                  <span className="text-xl font-bold text-slate-900">{t.score}%</span>
                  <span className="text-xs text-slate-400">{t.evidence} docs</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all ${t.status === 'Green' ? 'bg-emerald-500' : t.status === 'Amber' ? 'bg-amber-400' : 'bg-red-500'}`}
                    style={{ width: `${t.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row: At-Risk Learners + Recent Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* At-risk learners */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">At-Risk Learners</h3>
                <p className="text-xs text-slate-400">Requiring immediate attention</p>
              </div>
              <button onClick={() => navigate('/learners')} className="text-xs text-brand-600 hover:underline cursor-pointer">
                View all &rarr;
              </button>
            </div>
            <div className="space-y-2">
              {atRiskLearners.map((l) => (
                <div
                  key={l.id}
                  onClick={() => navigate(`/learners/${l.id}`)}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
                    {l.full_name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800">{l.full_name}</div>
                    <div className="text-xs text-slate-400 truncate">{l.programme} &middot; {l.coach}</div>
                  </div>
                  {/* Mini stats */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-medium text-slate-700">{l.attendance_pct}%</div>
                      <div className="text-xs text-slate-400">attend.</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-medium text-slate-700">{Math.round((l.otjh_logged / l.otjh_target) * 100)}%</div>
                      <div className="text-xs text-slate-400">OTJH</div>
                    </div>
                    <RagBadge status={l.rag_status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Actions */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Recent Actions</h3>
                <p className="text-xs text-slate-400">{mockActions.filter(a => a.status !== 'Completed').length} open actions</p>
              </div>
              <button onClick={() => navigate('/actions')} className="text-xs text-brand-600 hover:underline cursor-pointer">
                View all &rarr;
              </button>
            </div>
            <div className="space-y-2">
              {recentActions.map((a) => {
                const priorityColor: Record<string, string> = {
                  Critical: 'bg-red-50 text-red-700 border border-red-200',
                  High: 'bg-amber-50 text-amber-700 border border-amber-200',
                  Medium: 'bg-slate-100 text-slate-600',
                  Low: 'bg-slate-50 text-slate-400',
                };
                const statusColor: Record<string, string> = {
                  Open: 'text-slate-500',
                  'In Progress': 'text-brand-600',
                  Completed: 'text-emerald-600',
                };
                const isOverdue = new Date(a.due_date) < new Date('2024-12-01');
                return (
                  <div
                    key={a.id}
                    onClick={() => navigate('/actions')}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                  >
                    <span className={`badge mt-0.5 flex-shrink-0 ${priorityColor[a.priority]}`}>{a.priority}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-800 leading-snug truncate">{a.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-slate-400">{a.owner}</span>
                        <span className="text-slate-200">·</span>
                        <span className={`text-xs flex items-center gap-0.5 ${isOverdue && a.status !== 'Completed' ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                          {isOverdue && a.status !== 'Completed' && <i className="ri-alarm-warning-line text-xs"></i>}
                          {a.due_date}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium flex-shrink-0 mt-0.5 ${statusColor[a.status]}`}>{a.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coach Workload Panel */}
        <CoachWorkloadPanel />

        {/* Safeguarding Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Safeguarding Overview</h3>
              <p className="text-xs text-slate-400">Restricted — authorised users only</p>
            </div>
            <button onClick={() => navigate('/safeguarding')} className="btn-secondary text-xs">
              Full Dashboard &rarr;
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Open Cases', value: 2, icon: 'ri-folder-open-line', color: 'text-amber-600 bg-amber-50' },
              { label: 'Active Interventions', value: 1, icon: 'ri-heart-pulse-line', color: 'text-red-600 bg-red-50' },
              { label: 'Resolved This Month', value: 3, icon: 'ri-check-double-line', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Wellbeing Referrals', value: 5, icon: 'ri-user-heart-line', color: 'text-brand-600 bg-brand-50' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  <i className={`${s.icon} text-sm`}></i>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-500 leading-tight">{s.label}</div>
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
                {mockSafeguardingCases.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="table-td font-mono text-xs">{c.id}</td>
                    <td className="table-td">
                      <RagBadge status={c.severity === 'Medium' ? 'Amber' : c.severity === 'High' ? 'Red' : 'Green'} />
                    </td>
                    <td className="table-td text-xs">{c.category}</td>
                    <td className="table-td">
                      <span className={`badge ${c.status === 'Active' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="table-td text-xs">{c.assigned_to}</td>
                    <td className="table-td text-xs text-slate-400">{c.last_updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
