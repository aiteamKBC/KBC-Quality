import { ActionItem } from '@/mocks/actions';

interface ActionListViewProps {
  items: ActionItem[];
  onSelect: (id: string) => void;
}

const priorityConfig: Record<string, { color: string; dot: string }> = {
  Critical: { color: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
  High: { color: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
  Medium: { color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  Low: { color: 'bg-slate-50 text-slate-400', dot: 'bg-slate-300' },
};

const statusConfig: Record<string, { color: string; icon: string }> = {
  Open: { color: 'bg-slate-100 text-slate-600', icon: 'ri-circle-line' },
  'In Progress': { color: 'bg-brand-50 text-brand-700 border border-brand-200', icon: 'ri-loader-4-line' },
  Completed: { color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'ri-check-double-line' },
  Escalated: { color: 'bg-red-50 text-red-700 border border-red-200', icon: 'ri-alarm-warning-line' },
};

const ragDot: Record<string, string> = {
  Red: 'bg-red-500',
  Amber: 'bg-amber-400',
  Green: 'bg-emerald-500',
};

const categoryColors: Record<string, string> = {
  'Learner Progress': 'bg-brand-100 text-brand-700',
  Compliance: 'bg-violet-100 text-violet-700',
  Quality: 'bg-emerald-100 text-emerald-700',
  Safeguarding: 'bg-red-100 text-red-700',
  Evidence: 'bg-amber-100 text-amber-700',
  Ofsted: 'bg-slate-100 text-slate-600',
};

export default function ActionListView({ items, onSelect }: ActionListViewProps) {
  const today = new Date('2025-01-01');

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-slate-100 mb-4">
          <i className="ri-check-double-line text-2xl text-slate-300"></i>
        </div>
        <p className="text-sm font-medium text-slate-500">No actions match your filters</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting the filters above</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[minmax(0,2fr)_110px_90px_100px_120px_130px_100px] gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
        <span>Action</span>
        <span>Category</span>
        <span>Priority</span>
        <span>Status</span>
        <span>Owner</span>
        <span>Due Date</span>
        <span>Linked To</span>
      </div>

      <div className="divide-y divide-slate-50">
        {items.map((action) => {
          const isOverdue = action.status !== 'Completed' && new Date(action.due_date) < today;
          const daysLeft = Math.ceil((new Date(action.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const { color: priColor } = priorityConfig[action.priority] || priorityConfig.Medium;
          const { color: statColor, icon: statIcon } = statusConfig[action.status] || statusConfig.Open;

          return (
            <div
              key={action.id}
              onClick={() => onSelect(action.id)}
              className="grid grid-cols-[minmax(0,2fr)_110px_90px_100px_120px_130px_100px] gap-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer group transition-colors items-center"
            >
              {/* Action title */}
              <div className="min-w-0">
                <div className="flex items-start gap-2">
                  {isOverdue && (
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-alarm-warning-line text-red-500 text-xs"></i>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate group-hover:text-brand-700">{action.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{action.description.slice(0, 70)}…</p>
                    {action.progress_pct > 0 && action.status !== 'Completed' && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden max-w-24">
                          <div className="h-full rounded-full bg-brand-400" style={{ width: `${action.progress_pct}%` }}></div>
                        </div>
                        <span className="text-xs text-slate-400">{action.progress_pct}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${categoryColors[action.category] || 'bg-slate-100 text-slate-500'}`}>
                  {action.category}
                </span>
              </div>

              {/* Priority */}
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit ${priColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[action.priority]?.dot}`}></span>
                  {action.priority}
                </span>
              </div>

              {/* Status */}
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit ${statColor}`}>
                  <i className={`${statIcon} text-xs`}></i>
                  {action.status}
                </span>
              </div>

              {/* Owner */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {action.owner_initials}
                </div>
                <span className="text-xs text-slate-600 truncate">{action.owner.split(' ')[0]}</span>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ragDot[action.rag_status]}`}></span>
                <span className={`text-xs ${
                  isOverdue ? 'text-red-600 font-semibold' :
                  daysLeft <= 7 && daysLeft > 0 ? 'text-amber-600 font-medium' :
                  'text-slate-600'
                }`}>
                  {action.due_date}
                  {!isOverdue && daysLeft <= 7 && daysLeft > 0 && (
                    <span className="ml-1 text-amber-500 text-xs">({daysLeft}d)</span>
                  )}
                </span>
              </div>

              {/* Linked To */}
              <div className="flex items-center gap-1.5 min-w-0">
                {action.linked_learner ? (
                  <>
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <i className="ri-user-line text-brand-400 text-xs"></i>
                    </div>
                    <span className="text-xs text-slate-500 truncate">{action.linked_learner.split(' ')[0]}</span>
                  </>
                ) : action.linked_employer ? (
                  <>
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <i className="ri-building-2-line text-amber-400 text-xs"></i>
                    </div>
                    <span className="text-xs text-slate-500 truncate">{action.linked_employer.split(' ')[0]}</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-300">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
