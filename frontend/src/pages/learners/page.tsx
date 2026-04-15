import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/feature/AppLayout';
import RagBadge from '@/components/base/RagBadge';
import CustomSelect from '@/components/base/CustomSelect';
import { fetchLearners } from '@/lib/learnersApi';
import type { Learner } from '@/types/learners';

export default function LearnersPage() {
  const navigate = useNavigate();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [ragFilter, setRagFilter] = useState('All');
  const [progFilter, setProgFilter] = useState('All');
  const [coachFilter, setCoachFilter] = useState('All');
  const [sortField, setSortField] = useState('full_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    let cancelled = false;

    async function loadLearners() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchLearners();
        if (!cancelled) {
          setLearners(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load learners');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadLearners();

    return () => {
      cancelled = true;
    };
  }, []);

  const coaches = [...new Set(learners.map((l) => l.coach).filter(Boolean))];
  const programmes = [...new Set(learners.map((l) => l.programme).filter(Boolean))];

  const programmeOptions = [
    { value: 'All', label: 'All Programmes', icon: 'ri-book-open-line' },
    ...programmes.map((programme) => ({ value: programme, label: programme, icon: 'ri-graduation-cap-line' })),
  ];

  const coachOptions = [
    { value: 'All', label: 'All Coaches', icon: 'ri-team-line' },
    ...coaches.map((c) => ({ value: c, label: c, icon: 'ri-user-line' })),
  ];

  const filtered = learners
    .filter((l) => {
      const matchSearch = !search || l.full_name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()) || l.employer.toLowerCase().includes(search.toLowerCase());
      const matchRag = ragFilter === 'All' || l.rag_status === ragFilter;
      const matchProg = progFilter === 'All' || l.programme === progFilter;
      const matchCoach = coachFilter === 'All' || l.coach === coachFilter;
      return matchSearch && matchRag && matchProg && matchCoach;
    })
    .sort((a, b) => {
      const va = (a as Record<string, unknown>)[sortField] as string | number;
      const vb = (b as Record<string, unknown>)[sortField] as string | number;
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const ragCounts = {
    Green: learners.filter(l => l.rag_status === 'Green').length,
    Amber: learners.filter(l => l.rag_status === 'Amber').length,
    Red: learners.filter(l => l.rag_status === 'Red').length,
  };

  const hasActiveFilters = ragFilter !== 'All' || progFilter !== 'All' || coachFilter !== 'All' || !!search;

  return (
    <AppLayout title="Learners">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Learners</h2>
            <p className="text-sm text-slate-500 mt-0.5">{learners.length} active learners across {programmes.length} programmes</p>
          </div>
        </div>

        {/* RAG Summary */}
        <div className="grid grid-cols-3 gap-3">
          {(['Green', 'Amber', 'Red'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRagFilter(ragFilter === r ? 'All' : r)}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${ragFilter === r ? (r === 'Green' ? 'border-emerald-400 bg-emerald-50' : r === 'Amber' ? 'border-amber-400 bg-amber-50' : 'border-red-400 bg-red-50') : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${r === 'Green' ? 'bg-emerald-500' : r === 'Amber' ? 'bg-amber-400' : 'bg-red-500'}`}></span>
              <div>
                <div className="text-lg font-bold text-slate-900">{ragCounts[r]}</div>
                <div className="text-xs text-slate-500">{r} Status</div>
              </div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-slate-400 text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, employer..."
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
            value={progFilter}
            onChange={setProgFilter}
            options={programmeOptions}
            className="w-52"
          />

          <CustomSelect
            value={coachFilter}
            onChange={setCoachFilter}
            options={coachOptions}
            className="w-44"
          />

          {hasActiveFilters && (
            <button
              onClick={() => { setRagFilter('All'); setProgFilter('All'); setCoachFilter('All'); setSearch(''); }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-close-line"></i> Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{filtered.length} learners</span>
          </div>
          {loading && (
            <div className="px-4 py-10 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              Loading learners...
            </div>
          )}
          {!loading && error && (
            <div className="px-4 py-10 text-center">
              <div className="text-sm text-red-500">{error}</div>
              <button className="btn-primary mt-4" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}
          {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {[
                    { field: 'full_name', label: 'Learner' },
                    { field: 'programme', label: 'Programme' },
                    { field: 'employer', label: 'Employer' },
                    { field: 'coach', label: 'Coach' },
                    { field: 'attendance_pct', label: 'Attendance' },
                    { field: 'otjh_logged', label: 'OTJH' },
                    { field: 'progress', label: 'Progress' },
                    { field: 'rag_status', label: 'RAG' },
                  ].map((col) => (
                    <th key={col.field} className="table-th cursor-pointer hover:bg-slate-100" onClick={() => handleSort(col.field)}>
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortField === col.field && sortDir === 'asc' && <i className="ri-arrow-up-s-line text-brand-500"></i>}
                        {sortField === col.field && sortDir === 'desc' && <i className="ri-arrow-down-s-line text-brand-500"></i>}
                      </div>
                    </th>
                  ))}
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="table-row cursor-pointer" onClick={() => navigate(`/learners/${l.id}`)}>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold flex-shrink-0">
                          {l.full_name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{l.full_name}</div>
                          <div className="text-xs text-slate-400">{l.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="text-xs">{l.programme}</div>
                      <div className="text-xs text-slate-400">{l.cohort}</div>
                    </td>
                    <td className="table-td text-xs">{l.employer}</td>
                    <td className="table-td text-xs">{l.coach}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-1.5 rounded-full ${l.attendance_pct >= 90 ? 'bg-emerald-500' : l.attendance_pct >= 80 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${l.attendance_pct}%` }}></div>
                        </div>
                        <span className="text-xs font-medium">{l.attendance_pct}%</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="text-xs font-medium">{l.otjh_logged}h</div>
                      <div className="text-xs text-slate-400">of {l.otjh_target}h</div>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-1.5 bg-brand-400 rounded-full" style={{ width: `${l.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-medium">{l.progress}%</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="flex flex-col gap-1">
                        <RagBadge status={l.rag_status} />
                        {l.risk_flags.slice(0, 1).map((f) => (
                          <span key={f} className="text-xs text-slate-400 truncate max-w-20">{f}</span>
                        ))}
                      </div>
                    </td>
                    <td className="table-td">
                      <button className="btn-ghost text-xs py-1 px-2" onClick={(e) => { e.stopPropagation(); navigate(`/learners/${l.id}`); }}>
                        View <i className="ri-arrow-right-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">No learners match your filters</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
