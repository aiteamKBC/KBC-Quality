import { useState } from 'react';
import { EvidenceItem } from '@/mocks/evidence';

interface EvidencePreviewPanelProps {
  item: EvidenceItem;
  onClose: () => void;
}

const fileIconConfig = (ft: string) => {
  switch (ft) {
    case 'PDF': return { icon: 'ri-file-pdf-line', bg: 'bg-red-50', color: 'text-red-500', accent: 'border-red-200' };
    case 'DOCX': return { icon: 'ri-file-word-line', bg: 'bg-brand-50', color: 'text-brand-500', accent: 'border-brand-200' };
    case 'XLSX': return { icon: 'ri-file-excel-line', bg: 'bg-emerald-50', color: 'text-emerald-600', accent: 'border-emerald-200' };
    case 'MP4': return { icon: 'ri-video-line', bg: 'bg-violet-50', color: 'text-violet-500', accent: 'border-violet-200' };
    case 'PNG': return { icon: 'ri-image-line', bg: 'bg-amber-50', color: 'text-amber-500', accent: 'border-amber-200' };
    default: return { icon: 'ri-file-3-line', bg: 'bg-slate-50', color: 'text-slate-400', accent: 'border-slate-200' };
  }
};

const themeColors: Record<string, string> = {
  'Quality of Education': 'bg-brand-100 text-brand-700',
  'Behaviours & Attitudes': 'bg-violet-100 text-violet-700',
  'Personal Development': 'bg-emerald-100 text-emerald-700',
  'Leadership & Management': 'bg-slate-100 text-slate-700',
  'Safeguarding': 'bg-red-100 text-red-700',
  'Employer Engagement': 'bg-amber-100 text-amber-700',
};

const mockComments = [
  { id: 1, author: 'Laura Jennings', date: '2024-10-17', text: 'Reviewed and signed off — good progress this quarter.', avatar: 'LJ' },
  { id: 2, author: 'Sarah Mitchell', date: '2024-10-20', text: 'Added to SAR evidence bank for Q2.', avatar: 'SM' },
];

const mockAuditLog = [
  { id: 1, action: 'Uploaded', user: 'Laura Jennings', date: '2024-10-16 09:14' },
  { id: 2, action: 'Reviewed', user: 'Sarah Mitchell', date: '2024-10-17 11:32' },
  { id: 3, action: 'Status set to Verified', user: 'Sarah Mitchell', date: '2024-10-17 11:33' },
  { id: 4, action: 'Linked to SAR Q2', user: 'Kevin Richards', date: '2024-10-21 14:05' },
];

type Tab = 'details' | 'comments' | 'audit';

export default function EvidencePreviewPanel({ item, onClose }: EvidencePreviewPanelProps) {
  const [tab, setTab] = useState<Tab>('details');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(mockComments);

  const { icon, bg, color, accent } = fileIconConfig(item.file_type);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: Date.now(), author: 'You', date: new Date().toISOString().split('T')[0], text: newComment.trim(), avatar: 'YO' },
    ]);
    setNewComment('');
  };

  const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();
  const expiresSOon = item.expiry_date && !isExpired &&
    (new Date(item.expiry_date).getTime() - Date.now()) < 1000 * 60 * 60 * 24 * 30;

  return (
    <div className="w-80 flex-shrink-0 bg-white rounded-lg border border-slate-200 flex flex-col overflow-hidden">
      {/* Header strip */}
      <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between ${bg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 flex items-center justify-center rounded ${bg} border ${accent} ${color}`}>
            <i className={`${icon} text-sm`}></i>
          </div>
          <span className={`text-xs font-bold ${color}`}>{item.file_type}</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/60 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <i className="ri-close-line"></i>
        </button>
      </div>

      {/* Title section */}
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 leading-snug">{item.title}</h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            item.review_status === 'Verified'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : item.review_status === 'Rejected'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {item.review_status === 'Verified' && <i className="ri-check-line mr-1"></i>}
            {item.review_status === 'Pending Review' && <i className="ri-time-line mr-1"></i>}
            {item.review_status}
          </span>
          <span className="text-xs text-slate-400">{item.file_size}</span>
          <span className="text-xs text-slate-400">{item.version}</span>
        </div>
        {isExpired && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded-md px-2.5 py-1.5">
            <i className="ri-error-warning-line"></i>
            <span>Expired {item.expiry_date}</span>
          </div>
        )}
        {expiresSOon && !isExpired && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-md px-2.5 py-1.5">
            <i className="ri-alarm-warning-line"></i>
            <span>Expires {item.expiry_date}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {(['details', 'comments', 'audit'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors cursor-pointer ${
              tab === t
                ? 'text-brand-600 border-b-2 border-brand-500'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'comments' ? `Comments (${comments.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'details' && (
          <div className="p-4 space-y-4">
            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </div>

            {/* Theme badge */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Inspection Theme</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${themeColors[item.inspection_theme] || 'bg-slate-100 text-slate-600'}`}>
                {item.inspection_theme}
              </span>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata grid */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Metadata</p>
              {[
                { label: 'Category', value: item.category, icon: 'ri-folder-2-line' },
                { label: 'Uploaded By', value: item.uploaded_by, icon: 'ri-user-line' },
                { label: 'Upload Date', value: item.created_at, icon: 'ri-calendar-line' },
                { label: 'Version', value: item.version, icon: 'ri-git-branch-line' },
                ...(item.expiry_date ? [{ label: 'Expires', value: item.expiry_date, icon: 'ri-alarm-line' }] : []),
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <i className={`${m.icon} text-slate-300`}></i>
                    {m.label}
                  </span>
                  <span className="text-xs text-slate-700 font-medium text-right max-w-[160px] truncate">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Linked records */}
            {(item.linked_learner || item.linked_employer) && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Linked Records</p>
                <div className="space-y-1.5">
                  {item.linked_learner && (
                    <div className="flex items-center gap-2 text-xs bg-slate-50 rounded-md px-3 py-2">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-user-line text-brand-500"></i>
                      </div>
                      <span className="text-slate-600">{item.linked_learner}</span>
                      <span className="ml-auto text-slate-400">Learner</span>
                    </div>
                  )}
                  {item.linked_employer && (
                    <div className="flex items-center gap-2 text-xs bg-slate-50 rounded-md px-3 py-2">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-building-2-line text-amber-500"></i>
                      </div>
                      <span className="text-slate-600">{item.linked_employer}</span>
                      <span className="ml-auto text-slate-400">Employer</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'comments' && (
          <div className="p-4 space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <div className="w-7 h-7 flex-shrink-0 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  {c.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-slate-700">{c.author}</span>
                    <span className="text-xs text-slate-400">{c.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-md px-2.5 py-2">{c.text}</p>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value.slice(0, 500))}
                placeholder="Add a comment..."
                rows={2}
                className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-slate-400">{newComment.length}/500</span>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-3 py-1.5 text-xs bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'audit' && (
          <div className="p-4">
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-100"></div>
              <div className="space-y-3">
                {mockAuditLog.map((log, idx) => (
                  <div key={log.id} className="flex items-start gap-3 pl-7 relative">
                    <div className={`absolute left-1.5 w-3 h-3 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                      idx === 0 ? 'border-brand-500 bg-brand-100' : 'border-slate-300 bg-white'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-700">{log.action}</p>
                      <p className="text-xs text-slate-400">{log.user} &middot; {log.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-download-2-line"></i> Download
        </button>
        <button className="flex items-center justify-center gap-1 py-2 px-3 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-share-line"></i> Share
        </button>
        <button className="flex items-center justify-center py-2 px-3 text-xs text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer">
          <i className="ri-delete-bin-line"></i>
        </button>
      </div>
    </div>
  );
}
