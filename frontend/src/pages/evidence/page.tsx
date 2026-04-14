import { useState, useMemo } from 'react';
import AppLayout from '@/components/feature/AppLayout';
import { mockEvidence, EvidenceItem } from '@/mocks/evidence';
import CategorySidebar from './components/CategorySidebar';
import BulkUploadModal from './components/BulkUploadModal';
import EvidencePreviewPanel from './components/EvidencePreviewPanel';
import EvidenceList from './components/EvidenceList';
import CustomSelect from '@/components/base/CustomSelect';

type SortKey = 'date' | 'name' | 'size';

const statusOptions = [
  { value: 'All', label: 'All Statuses', icon: 'ri-filter-3-line' },
  { value: 'Verified', label: 'Verified', dot: 'bg-emerald-500' },
  { value: 'Pending Review', label: 'Pending Review', dot: 'bg-amber-400' },
  { value: 'Rejected', label: 'Rejected', dot: 'bg-red-500' },
];

const sortOptions = [
  { value: 'date', label: 'Newest First', icon: 'ri-sort-desc' },
  { value: 'name', label: 'Name A–Z', icon: 'ri-sort-asc' },
];

// ... existing code ...

export default function EvidencePage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [themeFilter, setThemeFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ... existing code ...

  const filtered: EvidenceItem[] = useMemo(() => {
    let list = mockEvidence.filter((e) => {
      const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        (e.linked_learner && e.linked_learner.toLowerCase().includes(search.toLowerCase())) ||
        (e.linked_employer && e.linked_employer.toLowerCase().includes(search.toLowerCase()));
      const matchCat = catFilter === 'All' || e.category === catFilter;
      const matchStatus = statusFilter === 'All' || e.review_status === statusFilter;
      const matchTheme = themeFilter === 'All' || e.inspection_theme === themeFilter;
      return matchSearch && matchCat && matchStatus && matchTheme;
    });
    if (sortKey === 'date') list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sortKey === 'name') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [search, catFilter, statusFilter, themeFilter, sortKey]);

  const selectedItem = mockEvidence.find((e) => e.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleToggleCheck = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((e) => e.id)));
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCatFilter(cat);
    setSelectedId(null);
    setSelectedIds(new Set());
  };

  const handleThemeChange = (theme: string) => {
    setThemeFilter(theme);
    setSelectedId(null);
    setSelectedIds(new Set());
  };

  const bulkCount = selectedIds.size;
  const allChecked = filtered.length > 0 && selectedIds.size === filtered.length;

  const verifiedCount = mockEvidence.filter((e) => e.review_status === 'Verified').length;
  const pendingCount = mockEvidence.filter((e) => e.review_status === 'Pending Review').length;

  return (
    <AppLayout title="Evidence Vault">
      <div className="flex flex-col h-full space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Evidence Vault</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {mockEvidence.length} documents &middot;{' '}
              <span className="text-emerald-600 font-medium">{verifiedCount} verified</span>
              {' '}&middot;{' '}
              <span className="text-amber-600 font-medium">{pendingCount} pending review</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {bulkCount > 0 && (
              <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2">
                <span className="text-xs font-semibold text-brand-700">{bulkCount} selected</span>
                <button className="text-xs text-brand-600 hover:text-brand-800 cursor-pointer whitespace-nowrap flex items-center gap-1">
                  <i className="ri-download-2-line"></i> Download
                </button>
                <span className="text-brand-200">|</span>
                <button className="text-xs text-red-500 hover:text-red-700 cursor-pointer whitespace-nowrap flex items-center gap-1">
                  <i className="ri-delete-bin-line"></i> Delete
                </button>
                <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer ml-1">
                  <i className="ri-close-line"></i>
                </button>
              </div>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-upload-cloud-2-line"></i>
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Search + sort bar */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-slate-400 text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Search by title, learner, employer, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
                <i className="ri-close-line text-sm"></i>
              </button>
            )}
          </div>
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            className="w-44"
          />
          <CustomSelect
            value={sortKey}
            onChange={(v) => setSortKey(v as SortKey)}
            options={sortOptions}
            className="w-40"
          />
          <div className="text-sm text-slate-500 whitespace-nowrap">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Main 3-column layout */}
        <div className="flex gap-4 flex-1 min-h-0 pb-2">
          <CategorySidebar
            items={mockEvidence}
            activeCategory={catFilter}
            activeTheme={themeFilter}
            onCategoryChange={handleCategoryChange}
            onThemeChange={handleThemeChange}
          />
          <EvidenceList
            items={filtered}
            selectedId={selectedId}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onToggleCheck={handleToggleCheck}
            onToggleAll={handleToggleAll}
            allChecked={allChecked}
          />
          {selectedItem && (
            <EvidencePreviewPanel
              item={selectedItem}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      </div>

      {showUploadModal && (
        <BulkUploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </AppLayout>
  );
}
