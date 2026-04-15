import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/feature/AppLayout';
import RagBadge from '@/components/base/RagBadge';
import OfstedRadarChart from '@/pages/dashboard/components/OfstedRadarChart';
import { fetchDashboardOverview } from '@/lib/dashboardApi';
import type { DashboardOverview } from '@/types/dashboard';

function readinessNarrative(summary: DashboardOverview['summary']) {
  return `Readiness is ${summary.ofsted_readiness}% based on live attendance (${summary.avg_attendance}%), progress (${summary.avg_progress}%), OTJH compliance (${summary.otjh_compliance_pct}%), and employer engagement (${summary.employer_engagement_pct}%).`;
}

export default function OfstedPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchDashboardOverview();
        if (!cancelled) setDashboard(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load Ofsted readiness');
          setDashboard(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOverview();
    return () => {
      cancelled = true;
    };
  }, []);

  const strongest = useMemo(() => {
    if (!dashboard?.ofsted_themes.length) return null;
    return [...dashboard.ofsted_themes].sort((a, b) => b.score - a.score)[0];
  }, [dashboard]);

  const weakest = useMemo(() => {
    if (!dashboard?.ofsted_themes.length) return null;
    return [...dashboard.ofsted_themes].sort((a, b) => a.score - b.score)[0];
  }, [dashboard]);

  return (
    <AppLayout title="Ofsted Readiness">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Ofsted Readiness</h2>
            <p className="mt-0.5 text-sm text-slate-500">Live readiness view derived from operational learner, review, action, safeguarding, and employer signals</p>
          </div>
          <button onClick={() => window.location.reload()} className="btn-primary flex items-center gap-1.5"><i className="ri-refresh-line text-xs"></i> Refresh</button>
        </div>

        {loading && <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">Loading Ofsted readiness...</div>}
        {!loading && error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-600">{error}</div>}

        {!loading && !error && dashboard && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="text-xs text-slate-500">Overall Readiness</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{dashboard.summary.ofsted_readiness}%</div>
                <div className="mt-2"><RagBadge status={dashboard.summary.ofsted_readiness >= 80 ? 'Green' : dashboard.summary.ofsted_readiness >= 65 ? 'Amber' : 'Red'} /></div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="text-xs text-slate-500">Strongest Theme</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{strongest?.theme || 'N/A'}</div>
                <div className="mt-1 text-sm text-slate-500">{strongest?.score ?? 0}% readiness</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="text-xs text-slate-500">Weakest Theme</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{weakest?.theme || 'N/A'}</div>
                <div className="mt-1 text-sm text-slate-500">{weakest?.score ?? 0}% readiness</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="text-xs text-slate-500">Critical Alerts</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{dashboard.alerts.filter((alert) => alert.severity === 'Red').length}</div>
                <button onClick={() => navigate('/dashboard')} className="mt-2 text-xs text-brand-600 hover:underline">Open executive dashboard &rarr;</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-3">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">Theme Radar</h3>
                  <p className="text-xs text-slate-400">Derived from live data sources only</p>
                </div>
                <OfstedRadarChart data={dashboard.ofsted_themes} />
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">Readiness Narrative</h3>
                  <p className="text-xs text-slate-400">Generated from current dashboard metrics</p>
                </div>
                <div className="rounded-lg border border-brand-100 bg-brand-50 p-4 text-sm leading-relaxed text-slate-700">
                  {readinessNarrative(dashboard.summary)}
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-slate-100 p-3"><div className="text-xs text-slate-500">Attendance signal</div><div className="mt-1 text-xl font-bold text-slate-900">{dashboard.summary.avg_attendance}%</div></div>
                  <div className="rounded-lg border border-slate-100 p-3"><div className="text-xs text-slate-500">Progress signal</div><div className="mt-1 text-xl font-bold text-slate-900">{dashboard.summary.avg_progress}%</div></div>
                  <div className="rounded-lg border border-slate-100 p-3"><div className="text-xs text-slate-500">OTJH signal</div><div className="mt-1 text-xl font-bold text-slate-900">{dashboard.summary.otjh_compliance_pct}%</div></div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Inspection Themes</h3>
                <p className="text-xs text-slate-400">Evidence counts reflect live signals feeding each theme</p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {dashboard.ofsted_themes.map((theme) => (
                  <div key={theme.theme} className="rounded-lg border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{theme.theme}</div>
                        <div className="mt-1 text-xs text-slate-500">{theme.evidence} live evidence signals</div>
                      </div>
                      <RagBadge status={theme.status} />
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div className="text-2xl font-bold text-slate-900">{theme.score}%</div>
                      <div className="text-xs text-slate-400">readiness</div>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-1.5 rounded-full ${theme.status === 'Green' ? 'bg-emerald-500' : theme.status === 'Amber' ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${theme.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">Operational Risks</h3>
                  <p className="text-xs text-slate-400">Current live issues feeding readiness</p>
                </div>
                <div className="space-y-2">
                  {dashboard.alerts.slice(0, 8).map((alert) => (
                    <div key={alert.id} className="rounded-lg border border-slate-100 p-3 flex items-start gap-3">
                      <span className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${alert.severity === 'Red' ? 'bg-red-500' : 'bg-amber-400'}`}></span>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{alert.type}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{alert.message}</div>
                      </div>
                    </div>
                  ))}
                  {dashboard.alerts.length === 0 && (
                    <div className="text-sm text-slate-400 text-center py-10">No current operational risks</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">At-Risk Learners</h3>
                  <p className="text-xs text-slate-400">Current learner records driving Amber/Red risk</p>
                </div>
                <div className="space-y-2">
                  {dashboard.at_risk_learners.map((learner) => (
                    <button key={learner.id} onClick={() => navigate(`/learners/${learner.id}`)} className="w-full rounded-lg border border-slate-100 p-3 text-left hover:border-slate-200">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium text-slate-800">{learner.full_name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{learner.programme}</div>
                        </div>
                        <RagBadge status={learner.rag_status} />
                      </div>
                      <div className="mt-2 text-xs text-slate-500">Attendance {learner.attendance_pct}% · Progress {learner.progress}% · OTJH {learner.otjh_logged}/{learner.otjh_target}h</div>
                    </button>
                  ))}
                  {dashboard.at_risk_learners.length === 0 && (
                    <div className="text-sm text-slate-400 text-center py-10">No at-risk learners in current feed</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
