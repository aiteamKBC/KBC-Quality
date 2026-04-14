import { ActionItem } from '@/mocks/actions';

interface KanbanBoardProps {
  items: ActionItem[];
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: ActionItem['status']) => void;
}

const COLUMNS: { status: ActionItem['status']; label: string; color: string; bg: string; headerBg: string }[] = [
  { status: 'Open', label: 'Open', color: 'text-slate-600', bg: 'bg-slate-50', headerBg: 'bg-slate-100 border-slate-200' },
  { status: 'In Progress', label: 'In Progress', color: 'text-brand-700', bg: 'bg-brand-50/40', headerBg: 'bg-brand-50 border-brand-200' },
  { status: 'Escalated', label: 'Escalated', color: 'text-red-700', bg: 'bg-red-50/30', headerBg: 'bg-red-50 border-red-200' },
  { status: 'Completed', label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50/30', headerBg: 'bg-emerald-50 border-emerald-200' },
];

const priorityConfig: Record<string, { color: string; dot: string }> = {
  Critical: { color: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
  High: { color: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
  Medium: { color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  Low: { color: 'bg-slate-50 text-slate-400', dot: 'bg-slate-300' },
};

const ragDot: Record<string, string> = {
  Red: 'bg-red-500',
  Amber: 'bg-amber-400',
  Green: 'bg-emerald-500',
};

const categoryColors: Record<string, string> = {
  'Learner Progress': 'text-brand-600',
  Compliance: 'text-violet-600',
  Quality: 'text-emerald-600',
  Safeguarding: 'text-red-600',
  Evidence: 'text-amber-600',
  Ofsted: 'text-slate-500',
};

export default function KanbanBoard({ items, onSelect, onStatusChange }: KanbanBoardProps) {
  const today = new Date('2025-01-01');

  return (
    <div className="grid grid-cols-4 gap-3 min-h-0 pb-2">
      {COLUMNS.map((col) => {
        const colItems = items.filter((a) => a.status === col.status);
        return (
          <div key={col.status} className={`rounded-xl border ${col.headerBg} flex flex-col min-h-0`}>
            {/* Column header */}
            <div className={`px-3 py-2.5 border-b ${col.headerBg} rounded-t-xl flex items-center justify-between`}>
              <span className={`text-xs font-bold uppercase tracking-wide ${col.color}`}>{col.label}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.headerBg} ${col.color} border`}>
                {colItems.length}
              </span>
            </div>

            {/* Cards */}
            <div className={`flex-1 overflow-y-auto p-2 space-y-2 ${col.bg}`}>
              {colItems.map((action) => {
                const isOverdue = action.status !== 'Completed' && new Date(action.due_date) < today;
                const daysLeft = Math.ceil((new Date(action.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const { color: priColor, dot: priDot } = priorityConfig[action.priority] || priorityConfig.Medium;

                return (
                  <div
                    key={action.id}
                    onClick={() => onSelect(action.id)}
                    className="bg-white rounded-lg border border-slate-200 p-3 hover:border-brand-300 hover:bg-brand-50/20 transition-colors cursor-pointer group"
                  >
                    {/* Priority + RAG row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${priColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priDot}`}></span>
                        {action.priority}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ragDot[action.rag_status]}`} title={`RAG: ${action.rag_status}`}></span>
                    </div>

                    {/* Title */}
                    <p className="text-xs font-semibold text-slate-800 leading-snug mb-2 group-hover:text-brand-800">
                      {action.title}
                    </p>

                    {/* Category */}
                    <p className={`text-xs font-medium mb-2 ${categoryColors[action.category] || 'text-slate-500'}`}>
                      <i className="ri-price-tag-3-line mr-1"></i>{action.category}
                    </p>

                    {/* Progress bar */}
                    {action.progress_pct > 0 && (
                      <div className="mb-2">
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${action.progress_pct === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                            style={{ width: `${action.progress_pct}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Linked learner chip */}
                    {action.linked_learner && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-user-line text-brand-400 text-xs"></i>
                        </div>
                        <span className="text-xs text-slate-500 truncate">{action.linked_learner}</span>
                      </div>
                    )}
                    {action.linked_employer && !action.linked_learner && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-building-2-line text-amber-400 text-xs"></i>
                        </div>
                        <span className="text-xs text-slate-500 truncate">{action.linked_employer}</span>
                      </div>
                    )}

                    {/* Footer row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                          {action.owner_initials}
                        </div>
                        <span className="text-xs text-slate-400">{action.owner.split(' ')[0]}</span>
                      </div>
                      <span className={`text-xs flex items-center gap-1 ${
                        isOverdue ? 'text-red-600 font-semibold' : daysLeft <= 7 && daysLeft > 0 ? 'text-amber-600' : 'text-slate-400'
                      }`}>
                        {isOverdue && <i className="ri-alarm-warning-line"></i>}
                        {action.due_date}
                      </span>
                    </div>

                    {/* Comments count */}
                    {action.comments.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-slate-50">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-chat-3-line text-slate-300 text-xs"></i>
                        </div>
                        <span className="text-xs text-slate-400">{action.comments.length} comment{action.comments.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {colItems.length === 0 && (
                <div className="text-center py-8 px-3">
                  <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2 rounded-full bg-white border border-slate-200">
                    <i className="ri-checkbox-blank-circle-line text-slate-300"></i>
                  </div>
                  <p className="text-xs text-slate-400">No actions</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
