import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/feature/AppLayout';
import RagBadge from '@/components/base/RagBadge';
import { mockEmployers } from '@/mocks/employers';
import { mockLearners } from '@/mocks/learners';
import { mockActions } from '@/mocks/actions';

const tabs = ['Overview', 'Learners', 'Communications', 'Actions', 'Timeline'];

export default function EmployerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const employer = mockEmployers.find((e) => e.id === id);
  if (!employer) return <AppLayout title="Not Found"><div className="text-center py-20 text-slate-400"><p>Employer not found</p><button onClick={() => navigate('/employers')} className="btn-primary mt-4">Back</button></div></AppLayout>;

  const linkedLearners = mockLearners.filter((l) => l.employer_id === id);
  const linkedActions = mockActions.filter((a) => a.linked_employer_id === id);

  const communications = [
    { date: '2024-11-20', type: 'Email', subject: 'Learner progress update - November', from: 'Nina Patel', summary: 'Monthly update sent to employer contact. Positive response received.' },
    { date: '2024-10-15', type: 'Visit', subject: 'Employer site visit', from: 'Nina Patel', summary: 'On-site visit completed. Discussed learner progress and OTJH logging.' },
    { date: '2024-09-10', type: 'Call', subject: 'Onboarding call - new cohort', from: 'Tom Beaumont', summary: 'Welcome call for new academic year. Expectations agreed.' },
  ];

  return (
    <AppLayout title={employer.name}>
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button onClick={() => navigate('/employers')} className="hover:text-slate-600 cursor-pointer">Employers</button>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-slate-700">{employer.name}</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <i className="ri-building-2-line text-slate-500 text-2xl"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-start gap-3 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{employer.name}</h2>
                  <p className="text-sm text-slate-500">{employer.sector} &middot; {employer.contact_name} &middot; {employer.contact_email}</p>
                </div>
                <RagBadge status={employer.rag_status} size="md" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {[
                  { label: 'Active Learners', value: employer.learner_count },
                  { label: 'Engagement Score', value: `${employer.engagement_score}%` },
                  { label: 'Open Concerns', value: employer.concerns },
                  { label: 'Last Contact', value: employer.last_contact },
                ].map((f) => (
                  <div key={f.label} className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-slate-900">{f.value}</div>
                    <div className="text-xs text-slate-500">{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 flex gap-0 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`tab-item ${activeTab === t ? 'tab-active' : 'tab-inactive'}`}>{t}</button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">AI Summary</h3>
              <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg text-xs text-slate-600 leading-relaxed">
                <div className="flex items-center gap-1.5 mb-2"><i className="ri-sparkling-line text-brand-500"></i><span className="text-brand-700 font-semibold">AI-Generated Summary</span></div>
                {employer.name} is a {employer.sector} employer with {employer.learner_count} active learners. Engagement score is {employer.engagement_score}% ({employer.rag_status}). {employer.concerns > 0 ? `There are ${employer.concerns} open concern(s) requiring attention.` : 'No open concerns at this time.'} Last contact was on {employer.last_contact}.
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Engagement Health</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={employer.engagement_score >= 80 ? '#10b981' : employer.engagement_score >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="12" strokeDasharray={`${(employer.engagement_score / 100) * 251.2} 251.2`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{employer.engagement_score}%</span>
                    <span className="text-xs text-slate-400">Score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Learners' && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-800">Linked Learners ({linkedLearners.length})</h3></div>
            {linkedLearners.length === 0 ? <div className="text-center py-10 text-slate-400 text-sm">No learners linked</div> : (
              <table className="w-full">
                <thead><tr><th className="table-th">Name</th><th className="table-th">Programme</th><th className="table-th">Coach</th><th className="table-th">Attendance</th><th className="table-th">OTJH</th><th className="table-th">RAG</th><th className="table-th"></th></tr></thead>
                <tbody>
                  {linkedLearners.map((l) => (
                    <tr key={l.id} className="table-row cursor-pointer" onClick={() => navigate(`/learners/${l.id}`)}>
                      <td className="table-td"><div className="text-xs font-semibold text-slate-800">{l.full_name}</div><div className="text-xs text-slate-400">{l.cohort}</div></td>
                      <td className="table-td text-xs">{l.programme}</td>
                      <td className="table-td text-xs">{l.coach}</td>
                      <td className="table-td text-xs font-medium">{l.attendance_pct}%</td>
                      <td className="table-td text-xs">{l.otjh_logged}h / {l.otjh_target}h</td>
                      <td className="table-td"><RagBadge status={l.rag_status} /></td>
                      <td className="table-td"><button className="btn-ghost text-xs py-1">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'Communications' && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-800">Communications</h3><button className="btn-primary text-xs">Log Contact</button></div>
            <div className="divide-y divide-slate-50">
              {communications.map((c, i) => (
                <div key={i} className="px-5 py-4 flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${c.type === 'Email' ? 'bg-brand-50 text-brand-500' : c.type === 'Visit' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                    <i className={`${c.type === 'Email' ? 'ri-mail-line' : c.type === 'Visit' ? 'ri-map-pin-line' : 'ri-phone-line'} text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-800">{c.subject}</span><span className="text-xs text-slate-400">{c.date}</span></div>
                    <div className="text-xs text-slate-500 mt-0.5">{c.summary}</div>
                    <div className="text-xs text-slate-400 mt-1">by {c.from}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Actions' && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-800">Actions ({linkedActions.length})</h3><button className="btn-primary text-xs">Create Action</button></div>
            {linkedActions.length === 0 ? <div className="text-center py-10 text-slate-400 text-sm">No actions for this employer</div> : (
              <table className="w-full">
                <thead><tr><th className="table-th">Title</th><th className="table-th">Priority</th><th className="table-th">Status</th><th className="table-th">Due Date</th><th className="table-th">Owner</th></tr></thead>
                <tbody>
                  {linkedActions.map((a) => (
                    <tr key={a.id} className="table-row">
                      <td className="table-td text-xs font-medium">{a.title}</td>
                      <td className="table-td"><span className={`badge ${a.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{a.priority}</span></td>
                      <td className="table-td"><span className="badge bg-slate-100 text-slate-600">{a.status}</span></td>
                      <td className="table-td text-xs">{a.due_date}</td>
                      <td className="table-td text-xs">{a.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'Timeline' && (
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-5">Employer Timeline</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200"></div>
              <div className="space-y-5">
                {communications.map((c, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${c.type === 'Email' ? 'bg-brand-50 text-brand-500' : c.type === 'Visit' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                      <i className={`${c.type === 'Email' ? 'ri-mail-line' : c.type === 'Visit' ? 'ri-map-pin-line' : 'ri-phone-line'} text-sm`}></i>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-700">{c.subject}</span><span className="text-xs text-slate-400">{c.date}</span></div>
                      <p className="text-xs text-slate-600 mt-1">{c.summary}</p>
                      <p className="text-xs text-slate-400 mt-0.5">by {c.from}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
