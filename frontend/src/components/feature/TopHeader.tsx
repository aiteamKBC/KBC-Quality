interface TopHeaderProps {
  title?: string;
}

export default function TopHeader({ title }: TopHeaderProps) {
  return (
    <header className="h-14 flex-shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6 flex">
      {title && <h1 className="hidden text-sm font-semibold text-slate-800 lg:block">{title}</h1>}

      <div className="max-w-md flex-1">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <i className="ri-search-line text-sm text-slate-400"></i>
          </div>
          <input
            type="text"
            placeholder="Search learners, employers, evidence..."
            readOnly
            value=""
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>
    </header>
  );
}
