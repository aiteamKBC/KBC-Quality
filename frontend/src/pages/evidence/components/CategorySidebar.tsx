import { EvidenceItem, evidenceCategories, categoryIcons, inspectionThemes } from '@/mocks/evidence';

interface CategorySidebarProps {
  items: EvidenceItem[];
  activeCategory: string;
  activeTheme: string;
  onCategoryChange: (cat: string) => void;
  onThemeChange: (theme: string) => void;
}

const themeColors: Record<string, string> = {
  'Quality of Education': 'bg-brand-500',
  'Behaviours & Attitudes': 'bg-violet-500',
  'Personal Development': 'bg-emerald-500',
  'Leadership & Management': 'bg-slate-500',
  'Safeguarding': 'bg-red-500',
  'Employer Engagement': 'bg-amber-500',
};

export default function CategorySidebar({
  items,
  activeCategory,
  activeTheme,
  onCategoryChange,
  onThemeChange,
}: CategorySidebarProps) {
  const countByCategory = (cat: string) =>
    items.filter((e) => cat === 'All' || e.category === cat).length;
  const countByTheme = (theme: string) =>
    items.filter((e) => theme === 'All' || e.inspection_theme === theme).length;

  const verifiedCount = items.filter((e) => e.review_status === 'Verified').length;
  const pendingCount = items.filter((e) => e.review_status === 'Pending Review').length;
  const rejectedCount = items.filter((e) => e.review_status === 'Rejected').length;

  return (
    <div className="w-56 flex-shrink-0 flex flex-col gap-4">
      {/* Stats Summary */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Vault Summary</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Total</span>
          <span className="font-semibold text-slate-800">{items.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Verified
          </span>
          <span className="font-semibold text-slate-800">{verifiedCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-amber-600">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Pending
          </span>
          <span className="font-semibold text-slate-800">{pendingCount}</span>
        </div>
        {rejectedCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Rejected
            </span>
            <span className="font-semibold text-slate-800">{rejectedCount}</span>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Categories</h3>
        </div>
        <div className="py-1">
          <button
            onClick={() => onCategoryChange('All')}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-brand-50 text-brand-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-folder-2-line text-sm"></i>
            </div>
            <span className="flex-1 text-left">All Documents</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              activeCategory === 'All' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
            }`}>{countByCategory('All')}</span>
          </button>
          {evidenceCategories.map((cat) => {
            const count = items.filter((e) => e.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${categoryIcons[cat] || 'ri-file-line'} text-sm`}></i>
                </div>
                <span className="flex-1 text-left truncate">{cat}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  activeCategory === cat ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inspection Themes */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ofsted Themes</h3>
        </div>
        <div className="py-1">
          <button
            onClick={() => onThemeChange('All')}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors cursor-pointer ${
              activeTheme === 'All'
                ? 'bg-brand-50 text-brand-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex-1 text-left">All Themes</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              activeTheme === 'All' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
            }`}>{countByTheme('All')}</span>
          </button>
          {inspectionThemes.map((theme) => {
            const count = items.filter((e) => e.inspection_theme === theme).length;
            return (
              <button
                key={theme}
                onClick={() => onThemeChange(theme)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-xs transition-colors cursor-pointer ${
                  activeTheme === theme
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${themeColors[theme] || 'bg-slate-400'}`}></span>
                <span className="flex-1 text-left leading-snug">{theme}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  activeTheme === theme ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
