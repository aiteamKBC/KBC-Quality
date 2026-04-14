import { useState } from 'react';
import { ActionItem } from '@/mocks/actions';
import { useNavigate } from 'react-router-dom';

interface ActionDetailDrawerProps {
  action: ActionItem;
  onClose: () => void;
  onStatusChange: (id: string, status: ActionItem['status']) => void;
}

const priorityConfig: Record<string, { color: string; dot: string }> = {
  Critical: { color: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
  High: { color: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
  Medium: { color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  Low: { color: 'bg-slate-50 text-slate-400', dot: 'bg-slate-300' },
};

const statusConfig: Record<string, { color: string; icon: string }> = {
  Open: { color: 'bg-slate-100 text-slate-600', icon: 'ri-circle-line' },
  'In Progress': { color: 'bg-brand-50 text-brand-700 border border-brand-200', icon: 'ri-loader-4-line' },
  Completed: { color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'ri-check-double-line' },
  Escalated: { color: 'bg-red-50 text-red-700 border border-red-200', icon: 'ri-alarm-warning-line' },
};

const ragConfig: Record<string, { bg: string; label: string }> = {
  Red: { bg: 'bg-red-500', label: 'Red' },
  Amber: { bg: 'bg-amber-400', label: 'Amber' },
  Green: { bg: 'bg-emerald-500', label: 'Green' },
};

const categoryColors: Record<string, string> = {
  'Learner Progress': 'bg-brand-100 text-brand-700',
  Compliance: 'bg-violet-100 text-violet-700',
  Quality: 'bg-emerald-100 text-emerald-700',
  Safeguarding: 'bg-red-100 text-red-700',
  Evidence: 'bg-amber-100 text-amber-700',
  Ofsted: 'bg-slate-100 text-slate-600',
};

const STATUS_ORDER: ActionItem['status'][] = ['Open', 'In Progress', 'Completed', 'Escalated'];

export default function ActionDetailDrawer({ action, onClose, onStatusChange }: ActionDetailDrawerProps) {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(action.comments);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const isOverdue = action.status !== 'Completed' && new Date(action.due_date) < new Date('2025-01-01');
  const { dot } = priorityConfig[action.priority] || priorityConfig.Medium;
  const { bg: ragBg } = ragConfig[action.rag_status] || ragConfig.Amber;

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, author: 'You', initials: 'YO', date: new Date().toISOString().split('T')[0], text: newComment.trim() },
    ]);
    setNewComment('');
  };

  const daysUntilDue = Math.ceil((new Date(action.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white h-full flex flex-col overflow-hidden border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`}></span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[action.category] || 'bg-slate-100 text-slate-600'}`}>
              {action.category}
            </span>
            <span className="text-xs text-slate-400">#{action.id}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Title + Status */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900 leading-snug mb-3">{action.title}</h2>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status selector */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu((p) => !p)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer ${statusConfig[action.status].color}`}
                >
                  <i className={statusConfig[action.status].icon}></i>
                  {action.status}
                  <i className="ri-arrow-down-s-line text-xs"></i>
                </button>
                {showStatusMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-slate-200 py-1 z-10 w-40">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        onClick={() => { onStatusChange(action.id, s); setShowStatusMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 cursor-pointer flex items-center gap-2 ${s === action.status ? 'font-semibold text-brand-600' : 'text-slate-600'}`}
                      >
                        <i className={statusConfig[s].icon}></i> {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityConfig[action.priority].color}`}>
                {action.priority}
              </span>

              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${ragBg}`}></span>
                RAG: {action.rag_status}
              </span>

              {isOverdue && (
                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                  <i className="ri-alarm-warning-line"></i> Overdue
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{action.description}</p>
          </div>

          {/* Metadata grid */}
          <div className="px-5 py-4 border-b border-slate-100 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Owner</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {action.owner_initials}
                </div>
                <span className="text-sm font-medium text-slate-700">{action.owner}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Due Date</p>
              <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : daysUntilDue <= 7 ? 'text-amber-600' : 'text-slate-700'}`}>
                {action.due_date}
                {!isOverdue && daysUntilDue <= 7 && daysUntilDue > 0 && (
                  <span className="text-xs ml-1 text-amber-500">({daysUntilDue}d left)</span>
                )}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Created</p>
              <span className="text-sm text-slate-700">{action.created_at}</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Progress</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${action.progress_pct === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                    style={{ width: `${action.progress_pct}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{action.progress_pct}%</span>
              </div>
            </div>
          </div>

          {/* Linked records */}
          {(action.linked_learner || action.linked_employer) && (
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">Linked Records</p>
              <div className="space-y-2">
                {action.linked_learner && (
                  <button
                    onClick={() => navigate(`/learners/${action.linked_learner_id}`)}
                    className="w-full flex items-center gap-3 p-3 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors cursor-pointer text-left group"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-200 text-brand-700 flex-shrink-0">
                      <i className="ri-user-line text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-800 group-hover:underline">{action.linked_learner}</p>
                      <p className="text-xs text-brand-500">Learner — click to view profile</p>
                    </div>
                    <i className="ri-arrow-right-line text-brand-400 text-sm group-hover:translate-x-0.5 transition-transform"></i>
                  </button>
                )}
                {action.linked_employer && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-200 text-amber-700 flex-shrink-0">
                      <i className="ri-building-2-line text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800">{action.linked_employer}</p>
                      <p className="text-xs text-amber-500">Employer</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Comments ({comments.length})
            </p>
            <div className="space-y-3 mb-4">
              {comments.length === 0 && (
                <p className="text-xs text-slate-400 italic">No comments yet — be the first to add one.</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {c.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-slate-700">{c.author}</span>
                      <span className="text-xs text-slate-400">{c.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value.slice(0, 500))}
                placeholder="Add a comment or update..."
                rows={3}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-slate-400">{newComment.length}/500</span>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-3 py-1.5 text-xs bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => onStatusChange(action.id, 'Completed')}
            disabled={action.status === 'Completed'}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-check-double-line"></i>
            Mark Complete
          </button>
          <button
            onClick={() => onStatusChange(action.id, 'Escalated')}
            disabled={action.status === 'Escalated' || action.status === 'Completed'}
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-alarm-warning-line"></i>
            Escalate
          </button>
        </div>
      </div>
    </div>
  );
}
