import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/feature/AppLayout';
import RagBadge from '@/components/base/RagBadge';
import { mockEmployers } from '@/mocks/employers';
import CustomSelect from '@/components/base/CustomSelect';

export default function EmployersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [ragFilter, setRagFilter] = useState('All');
  const [sectorFilter, setSectorFilter] = useState('All');

  const sectors = [...new Set(mockEmployers.map((e) => e.sector))];

  const sectorOptions = [
    { value: 'All', label: 'All Sectors', icon: 'ri-building-line' },
    ...sectors.map((s) => ({ value: s, label: s, icon: 'ri-building-2-line' })),
  ];

  const filtered = mockEmployers.filter((e) => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.contact_name.toLowerCase().includes(search.toLowerCase());
    const matchRag = ragFilter === 'All' || e.rag_status === ragFilter;
    const matchSector = sectorFilter === 'All' || e.sector === sectorFilter;
    return matchSearch && matchRag && matchSector;
  });

  return (
    <AppLayout title="Employers">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Employers</h2>
            <p className="text-sm text-slate-500 mt-0.5">{mockEmployers.length} employers &middot; {mockEmployers.reduce((s, e) => s + e.learner_count, 0)} linked learners</p>
          </div>
          <button className="btn-primary flex items-center gap-1.5"><i className="ri-add-line text-xs"></i> Add Employer</button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {(['Green', 'Amber', 'Red'] as const).map((r) => {
            const count = mockEmployers.filter(e => e.rag_status === r).length;
            return (
              <button key={r} onClick={() => setRagFilter(ragFilter === r ? 'All' : r)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${ragFilter === r ? (r === 'Green' ? 'border-emerald-400 bg-emerald-50' : r === 'Amber' ? 'border-amber-400 bg-amber-50' : 'border-red-400 bg-red-50') : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${r === 'Green' ? 'bg-emerald-500' : r === 'Amber' ? 'bg-amber-400' : 'bg-red-500'}`}></span>
                <div><div className="text-lg font-bold text-slate-900">{count}</div><div className="text-xs text-slate-500">{r} Engagement</div></div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
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
            value={sectorFilter}
            onChange={setSectorFilter}
            options={sectorOptions}
            className="w-52"
          />
          {(sectorFilter !== 'All' || ragFilter !== 'All' || search) && (
            <button
              onClick={() => { setSectorFilter('All'); setRagFilter('All'); setSearch(''); }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-close-line"></i> Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div key={emp.id} onClick={() => navigate(`/employers/${emp.id}`)}
              className="bg-white rounded-lg border border-slate-200 p-5 hover:border-brand-300 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <i className="ri-building-2-line text-slate-500"></i>
                </div>
                <RagBadge status={emp.rag_status} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{emp.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{emp.sector} &middot; {emp.contact_name}</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center"><div className="text-sm font-bold text-slate-900">{emp.learner_count}</div><div className="text-xs text-slate-400">Learners</div></div>
                <div className="text-center"><div className="text-sm font-bold text-slate-900">{emp.engagement_score}%</div><div className="text-xs text-slate-400">Engagement</div></div>
                <div className="text-center"><div className={`text-sm font-bold ${emp.concerns > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{emp.concerns}</div><div className="text-xs text-slate-400">Concerns</div></div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-1.5 rounded-full ${emp.engagement_score >= 80 ? 'bg-emerald-500' : emp.engagement_score >= 60 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${emp.engagement_score}%` }}></div>
              </div>
              <div className="mt-3 text-xs text-slate-400">Last contact: {emp.last_contact}</div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">No employers match your filters</div>
        )}
      </div>
    </AppLayout>
  );
}
