import { EvidenceItem } from '@/mocks/evidence';

interface EvidenceListProps {
  items: EvidenceItem[];
  selectedId: string | null;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onToggleAll: () => void;
  allChecked: boolean;
}

const fileIconConfig = (ft: string): { icon: string; bg: string; color: string } => {
  switch (ft) {
    case 'PDF': return { icon: 'ri-file-pdf-line', bg: 'bg-red-50', color: 'text-red-500' };
    case 'DOCX': return { icon: 'ri-file-word-line', bg: 'bg-brand-50', color: 'text-brand-500' };
    case 'XLSX': return { icon: 'ri-file-excel-line', bg: 'bg-emerald-50', color: 'text-emerald-600' };
    case 'MP4': return { icon: 'ri-video-line', bg: 'bg-violet-50', color: 'text-violet-500' };
    case 'PNG': return { icon: 'ri-image-line', bg: 'bg-amber-50', color: 'text-amber-500' };
    default: return { icon: 'ri-file-3-line', bg: 'bg-slate-50', color: 'text-slate-400' };
  }
};

const themeShort: Record<string, string> = {
  'Quality of Education': 'QoE',
  'Behaviours & Attitudes': 'B&A',
  'Personal Development': 'PD',
  'Leadership & Management': 'L&M',
  'Safeguarding': 'SG',
  'Employer Engagement': 'EE',
};

const themeColor: Record<string, string> = {
  'Quality of Education': 'bg-brand-100 text-brand-700',
  'Behaviours & Attitudes': 'bg-violet-100 text-violet-700',
  'Personal Development': 'bg-emerald-100 text-emerald-700',
  'Leadership & Management': 'bg-slate-100 text-slate-600',
  'Safeguarding': 'bg-red-100 text-red-700',
  'Employer Engagement': 'bg-amber-100 text-amber-700',
};

export default function EvidenceList({
  items,
  selectedId,
  selectedIds,
  onSelect,
  onToggleCheck,
  onToggleAll,
  allChecked,
}: EvidenceListProps) {
  return (
    <div className="flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col min-h-0">
      {/* Table header */}
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="w-5 h-5 flex items-center justify-center">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={onToggleAll}
            className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 cursor-pointer"
          />
        </div>
        <div className="flex-1 grid grid-cols-[minmax(0,1fr)_120px_80px_80px] gap-3 items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Document</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Theme</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {items.map((ev) => {
          const { icon, bg, color } = fileIconConfig(ev.file_type);
          const isSelected = selectedId === ev.id;
          const isChecked = selectedIds.has(ev.id);

          return (
            <div
              key={ev.id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-brand-50 border-l-2 border-brand-500'
                  : isChecked
                  ? 'bg-slate-50'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              {/* Checkbox */}
              <div
                className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); onToggleCheck(ev.id); }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleCheck(ev.id)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Main content */}
              <div
                className="flex-1 grid grid-cols-[minmax(0,1fr)_120px_80px_80px] gap-3 items-center"
                onClick={() => onSelect(ev.id)}
              >
                {/* Document info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${bg} ${color}`}>
                    <i className={`${icon} text-sm`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{ev.title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-slate-400 truncate">{ev.category}</span>
                      {(ev.linked_learner || ev.linked_employer) && (
                        <>
                          <span className="text-slate-200">·</span>
                          <span className="text-xs text-slate-400 truncate">
                            {ev.linked_learner || ev.linked_employer}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${themeColor[ev.inspection_theme] || 'bg-slate-100 text-slate-500'}`}>
                    {themeShort[ev.inspection_theme] || ev.inspection_theme}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    ev.review_status === 'Verified'
                      ? 'bg-emerald-50 text-emerald-700'
                      : ev.review_status === 'Rejected'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {ev.review_status === 'Pending Review' ? 'Pending' : ev.review_status}
                  </span>
                </div>

                {/* Date */}
                <div>
                  <span className="text-xs text-slate-400">{ev.created_at}</span>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 rounded-full bg-slate-100">
              <i className="ri-folder-open-line text-xl text-slate-300"></i>
            </div>
            <p className="text-sm text-slate-500 font-medium">No documents found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or upload new evidence</p>
          </div>
        )}
      </div>
    </div>
  );
}
