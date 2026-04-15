import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '@/components/feature/AppLayout';
import RagBadge from '@/components/base/RagBadge';
import { fetchEmployer } from '@/lib/employersApi';
import type { Employer } from '@/types/employers';

const tabs = ['Overview', 'Learners', 'Actions', 'Timeline'];

export default function EmployerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadEmployer() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchEmployer(id);
        if (!cancelled) setEmployer(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load employer');
          setEmployer(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadEmployer();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <AppLayout title="Employers"><div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">Loading live employer data...</div></AppLayout>;
  }

  if (error || !employer) {
    return (
      <AppLayout title="Not Found">
        <div className="text-center py-20 text-slate-400">
          <p>{error || 'Employer not found'}</p>
          <button onClick={() => navigate('/employers')} className="btn-primary mt-4">Back</button>
        </div>
      </AppLayout>
    );
  }

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
                  <p className="text-sm text-slate-500">{employer.primary_programme} &middot; {employer.contact_name} &middot; {employer.contact_email || 'No email recorded'}</p>
                </div>
                <RagBadge status={employer.rag_status} size="md" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {[
                  { label: 'Active Learners', value: employer.learner_count },
                  { label: 'Engagement Score', value: `${employer.engagement_score}%` },
                  { label: 'Open Concerns', value: employer.concerns },
                  { label: 'Latest Activity', value: employer.latest_activity || 'N/A' },
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
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-item ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`}>{tab}</button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Live Summary</h3>
              <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg text-xs text-slate-600 leading-relaxed">
                <div className="flex items-center gap-1.5 mb-2"><i className="ri-database-2-line text-brand-500"></i><span className="text-brand-700 font-semibold">Neon-backed summary</span></div>
                {employer.summary_text}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-lg border border-slate-100 p-3"><div className="text-xs text-slate-500">Avg Attendance</div><div className="text-xl font-bold text-slate-900 mt-1">{employer.avg_attendance}%</div></div>
                <div className="rounded-lg border border-slate-100 p-3"><div className="text-xs text-slate-500">Avg Progress</div><div className="text-xl font-bold text-slate-900 mt-1">{employer.avg_progress}%</div></div>
                <div className="rounded-lg border border-slate-100 p-3"><div className="text-xs text-slate-500">Avg OTJH</div><div className="text-xl font-bold text-slate-900 mt-1">{employer.avg_otjh_pct}%</div></div>
                <div className="rounded-lg border border-slate-100 p-3"><div className="text-xs text-slate-500">Reviews Scheduled</div><div className="text-xl font-bold text-slate-900 mt-1">{employer.reviews_due}</div></div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {employer.recent_activity?.slice(0, 5).map((item) => (
                  <div key={`${item.learner_id}-${item.date}-${item.module}`} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{item.learner_name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.module || 'Recorded session'}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-semibold ${item.attendance === 1 ? 'text-emerald-600' : 'text-red-600'}`}>{item.attendance === 1 ? 'Attended' : 'Missed'}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!employer.recent_activity || employer.recent_activity.length === 0) && (
                  <div className="text-sm text-slate-400 text-center py-10">No attendance activity recorded for this employer group</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Learners' && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-800">Linked Learners ({employer.learners?.length ?? 0})</h3></div>
            {!employer.learners?.length ? <div className="text-center py-10 text-slate-400 text-sm">No learners linked</div> : (
              <table className="w-full">
                <thead><tr><th className="table-th">Name</th><th className="table-th">Programme</th><th className="table-th">Coach</th><th className="table-th">Attendance</th><th className="table-th">OTJH</th><th className="table-th">RAG</th><th className="table-th"></th></tr></thead>
                <tbody>
                  {employer.learners.map((learner) => (
                    <tr key={learner.id} className="table-row cursor-pointer" onClick={() => navigate(`/learners/${learner.id}`)}>
                      <td className="table-td"><div className="text-xs font-semibold text-slate-800">{learner.full_name}</div><div className="text-xs text-slate-400">{learner.email}</div></td>
                      <td className="table-td text-xs">{learner.programme}</td>
                      <td className="table-td text-xs">{learner.coach}</td>
                      <td className="table-td text-xs font-medium">{learner.attendance_pct}%</td>
                      <td className="table-td text-xs">{learner.otjh_logged}h / {learner.otjh_target}h</td>
                      <td className="table-td"><RagBadge status={learner.rag_status} /></td>
                      <td className="table-td"><button className="btn-ghost text-xs py-1">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'Actions' && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-800">Actions ({employer.actions?.length ?? 0})</h3></div>
            {!employer.actions?.length ? <div className="text-center py-10 text-slate-400 text-sm">No live actions linked to learners under this employer</div> : (
              <table className="w-full">
                <thead><tr><th className="table-th">Title</th><th className="table-th">Priority</th><th className="table-th">Status</th><th className="table-th">Due Date</th><th className="table-th">Owner</th></tr></thead>
                <tbody>
                  {employer.actions.map((action) => (
                    <tr key={action.id} className="table-row">
                      <td className="table-td text-xs font-medium">{action.title}</td>
                      <td className="table-td"><span className={`badge ${action.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{action.priority}</span></td>
                      <td className="table-td"><span className="badge bg-slate-100 text-slate-600">{action.status}</span></td>
                      <td className="table-td text-xs">{action.due_date || 'N/A'}</td>
                      <td className="table-td text-xs">{action.owner}</td>
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
                {employer.timeline?.map((event) => (
                  <div key={event.id} className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${event.type === 'Attendance' ? 'bg-emerald-50 text-emerald-500' : 'bg-brand-50 text-brand-500'}`}>
                      <i className={`${event.type === 'Attendance' ? 'ri-calendar-check-line' : 'ri-file-list-3-line'} text-sm`}></i>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-700">{event.title}</span><span className="text-xs text-slate-400">{event.date}</span></div>
                      <p className="text-xs text-slate-600 mt-1">{event.text}</p>
                    </div>
                  </div>
                ))}
                {(!employer.timeline || employer.timeline.length === 0) && (
                  <div className="text-sm text-slate-400 text-center py-10">No timeline events available from live review or attendance data</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
