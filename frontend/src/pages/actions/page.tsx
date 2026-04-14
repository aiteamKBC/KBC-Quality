import { useState, useMemo } from 'react';
import AppLayout from '@/components/feature/AppLayout';
import { mockActions, actionCategories, actionOwners, ActionItem } from '@/mocks/actions';
import KanbanBoard from './components/KanbanBoard';
import ActionListView from './components/ActionListView';
import ActionDetailDrawer from './components/ActionDetailDrawer';
import NewActionModal from './components/NewActionModal';
import CustomSelect from '@/components/base/CustomSelect';

type ViewMode = 'list' | 'board';

const priorityOptions = [
  { value: 'All', label: 'All Priorities', icon: 'ri-filter-3-line' },
  { value: 'Critical', label: 'Critical', dot: 'bg-red-500' },
  { value: 'High', label: 'High', dot: 'bg-amber-500' },
  { value: 'Medium', label: 'Medium', dot: 'bg-slate-400' },
  { value: 'Low', label: 'Low', dot: 'bg-slate-300' },
];

const statusOptions = [
  { value: 'All', label: 'All Statuses', icon: 'ri-filter-3-line' },
  { value: 'Open', label: 'Open', icon: 'ri-circle-line' },
  { value: 'In Progress', label: 'In Progress', icon: 'ri-loader-4-line' },
  { value: 'Completed', label: 'Completed', icon: 'ri-check-double-line' },
  { value: 'Escalated', label: 'Escalated', icon: 'ri-alarm-warning-line' },
];

export default function ActionsPage() {
  const [view, setView] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [actions, setActions] = useState<ActionItem[]>(mockActions);

  const today = new Date('2025-01-01');

  const categoryOptions = useMemo(() => actionCategories.map((c) => ({
    value: c,
    label: c,
    icon: c === 'All' ? 'ri-filter-3-line' :
          c === 'Learner Progress' ? 'ri-user-line' :
          c === 'Compliance' ? 'ri-shield-check-line' :
          c === 'Quality' ? 'ri-award-line' :
          c === 'Safeguarding' ? 'ri-user-heart-line' :
          c === 'Evidence' ? 'ri-folder-2-line' :
          c === 'Ofsted' ? 'ri-government-line' : 'ri-bookmark-line',
  })), []);

  const ownerOptions = useMemo(() => actionOwners.map((o) => ({
    value: o,
    label: o,
    icon: o === 'All' ? 'ri-team-line' : 'ri-user-line',
  })), []);

  const filtered = useMemo(() => {
    return actions.filter((a) => {
      const matchSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.linked_learner && a.linked_learner.toLowerCase().includes(search.toLowerCase())) ||
        (a.linked_employer && a.linked_employer.toLowerCase().includes(search.toLowerCase())) ||
        a.owner.toLowerCase().includes(search.toLowerCase());
      const matchPriority = priorityFilter === 'All' || a.priority === priorityFilter;
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      const matchCategory = categoryFilter === 'All' || a.category === categoryFilter;
      const matchOwner = ownerFilter === 'All' || a.owner === ownerFilter;
      return matchSearch && matchPriority && matchStatus && matchCategory && matchOwner;
    });
  }, [actions, search, priorityFilter, statusFilter, categoryFilter, ownerFilter]);

  const selectedAction = actions.find((a) => a.id === selectedId) ?? null;

  const handleStatusChange = (id: string, status: ActionItem['status']) => {
    setActions((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status, progress_pct: status === 'Completed' ? 100 : a.progress_pct }
          : a
      )
    );
  };

  const criticalCount = actions.filter((a) => a.priority === 'Critical' && a.status !== 'Completed').length;
  const overdueCount = actions.filter((a) => a.status !== 'Completed' && new Date(a.due_date) < today).length;
  const inProgressCount = actions.filter((a) => a.status === 'In Progress').length;
  const completedCount = actions.filter((a) => a.status === 'Completed').length;
  const escalatedCount = actions.filter((a) => a.status === 'Escalated').length;
  const openCount = actions.filter((a) => a.status === 'Open').length;

  const statCards = [
    { label: 'Open', value: openCount, icon: 'ri-circle-line', color: 'text-slate-700', bg: 'bg-white', border: 'border-slate-200' },
    { label: 'In Progress', value: inProgressCount, icon: 'ri-loader-4-line', color: 'text-brand-700', bg: 'bg-brand-50', border: 'border-brand-200' },
    { label: 'Critical', value: criticalCount, icon: 'ri-error-warning-line', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    { label: 'Overdue', value: overdueCount, icon: 'ri-alarm-warning-line', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    { label: 'Escalated', value: escalatedCount, icon: 'ri-arrow-up-double-line', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    { label: 'Completed', value: completedCount, icon: 'ri-check-double-line', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ];

  return (
    <AppLayout title="Actions Tracker">
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Actions &amp; Improvement Tracker</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {actions.length} total actions &middot;{' '}
              <span className="text-red-600 font-medium">{criticalCount} critical</span>
              {' '}&middot;{' '}
              <span className="text-amber-600 font-medium">{overdueCount} overdue</span>
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            New Action
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-6 gap-2.5 flex-shrink-0">
          {statCards.map((s) => (
            <div
              key={s.label}
              onClick={() => setStatusFilter(s.label === 'Overdue' || s.label === 'Critical' ? 'All' : s.label)}
              className={`rounded-xl border ${s.border} ${s.bg} px-3 py-3 cursor-pointer hover:opacity-80 transition-opacity`}
            >
              <div className={`flex items-center gap-1.5 ${s.color} mb-1`}>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${s.icon} text-sm`}></i>
                </div>
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters + View toggle */}
        <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-slate-400 text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Search by title, owner, learner, employer..."
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
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={priorityOptions}
            className="w-40"
          />

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            className="w-40"
          />

          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
            className="w-44"
          />

          <CustomSelect
            value={ownerFilter}
            onChange={setOwnerFilter}
            options={ownerOptions}
            className="w-44"
          />

          <span className="text-sm text-slate-500 whitespace-nowrap">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>

          {/* View toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden ml-auto">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                view === 'list' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className="ri-list-check-2"></i> List
            </button>
            <button
              onClick={() => setView('board')}
              className={`px-3 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                view === 'board' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className="ri-kanban-view"></i> Board
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {view === 'list' && (
            <ActionListView items={filtered} onSelect={setSelectedId} />
          )}
          {view === 'board' && (
            <KanbanBoard
              items={filtered}
              onSelect={setSelectedId}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>

      {selectedAction && (
        <ActionDetailDrawer
          action={selectedAction}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {showNewModal && (
        <NewActionModal
          onClose={() => setShowNewModal(false)}
          onSubmit={() => setShowNewModal(false)}
        />
      )}
    </AppLayout>
  );
}
