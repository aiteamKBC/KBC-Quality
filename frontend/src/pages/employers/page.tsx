import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/feature/AppLayout';
import RagBadge from '@/components/base/RagBadge';
import CustomSelect from '@/components/base/CustomSelect';
import { fetchEmployers } from '@/lib/employersApi';
import type { Employer } from '@/types/employers';

export default function EmployersPage() {
  const navigate = useNavigate();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [ragFilter, setRagFilter] = useState('All');
  const [programmeFilter, setProgrammeFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;

    async function loadEmployers() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchEmployers();
        if (!cancelled) setEmployers(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load employers');
          setEmployers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadEmployers();
    return () => {
      cancelled = true;
    };
  }, []);

  const programmes = useMemo(
    () => [...new Set(employers.map((employer) => employer.primary_programme).filter(Boolean))],
    [employers],
  );

  const programmeOptions = [
    { value: 'All', label: 'All Programmes', icon: 'ri-book-open-line' },
    ...programmes.map((programme) => ({ value: programme, label: programme, icon: 'ri-graduation-cap-line' })),
  ];

  const filtered = employers.filter((employer) => {
    const term = search.toLowerCase();
    const matchSearch = !search
      || employer.name.toLowerCase().includes(term)
      || employer.contact_name.toLowerCase().includes(term)
      || employer.contact_email.toLowerCase().includes(term);
    const matchRag = ragFilter === 'All' || employer.rag_status === ragFilter;
    const matchProgramme = programmeFilter === 'All' || employer.primary_programme === programmeFilter;
    return matchSearch && matchRag && matchProgramme;
  });

  return (
    <AppLayout title="Employers">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Employers</h2>
            <p className="text-sm text-slate-500 mt-0.5">{employers.length} employers &middot; {employers.reduce((sum, employer) => sum + employer.learner_count, 0)} linked learners</p>
          </div>
          <button onClick={() => window.location.reload()} className="btn-primary flex items-center gap-1.5"><i className="ri-refresh-line text-xs"></i> Refresh</button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['Green', 'Amber', 'Red'] as const).map((status) => {
            const count = employers.filter((employer) => employer.rag_status === status).length;
            return (
              <button
                key={status}
                onClick={() => setRagFilter(ragFilter === status ? 'All' : status)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${ragFilter === status ? (status === 'Green' ? 'border-emerald-400 bg-emerald-50' : status === 'Amber' ? 'border-amber-400 bg-amber-50' : 'border-red-400 bg-red-50') : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${status === 'Green' ? 'bg-emerald-500' : status === 'Amber' ? 'bg-amber-400' : 'bg-red-500'}`}></span>
                <div>
                  <div className="text-lg font-bold text-slate-900">{count}</div>
                  <div className="text-xs text-slate-500">{status} Engagement</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><i className="ri-search-line text-slate-400 text-sm"></i></div>
            <input
              type="text"
              placeholder="Search employers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
                <i className="ri-close-line text-sm"></i>
              </button>
            )}
          </div>
          <CustomSelect
            value={programmeFilter}
            onChange={setProgrammeFilter}
            options={programmeOptions}
            className="w-56"
          />
          {(programmeFilter !== 'All' || ragFilter !== 'All' || search) && (
            <button
              onClick={() => { setProgrammeFilter('All'); setRagFilter('All'); setSearch(''); }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-close-line"></i> Clear filters
            </button>
          )}
        </div>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">Loading live employers...</div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((employer) => (
              <div key={employer.id} onClick={() => navigate(`/employers/${employer.id}`)} className="bg-white rounded-lg border border-slate-200 p-5 hover:border-brand-300 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <i className="ri-building-2-line text-slate-500"></i>
                  </div>
                  <RagBadge status={employer.rag_status} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{employer.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{employer.primary_programme} &middot; {employer.contact_name}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center"><div className="text-sm font-bold text-slate-900">{employer.learner_count}</div><div className="text-xs text-slate-400">Learners</div></div>
                  <div className="text-center"><div className="text-sm font-bold text-slate-900">{employer.engagement_score}%</div><div className="text-xs text-slate-400">Engagement</div></div>
                  <div className="text-center"><div className={`text-sm font-bold ${employer.concerns > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{employer.concerns}</div><div className="text-xs text-slate-400">Concerns</div></div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-1.5 rounded-full ${employer.engagement_score >= 80 ? 'bg-emerald-500' : employer.engagement_score >= 65 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${employer.engagement_score}%` }}></div>
                </div>
                <div className="mt-3 text-xs text-slate-400">Latest activity: {employer.latest_activity || 'N/A'}</div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">No employers match your filters</div>
        )}
      </div>
    </AppLayout>
  );
}
