import { useState, useRef, useEffect, useCallback } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  dot?: string;
  meta?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  size = 'sm',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value || o.label === value);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  const heightCls = size === 'sm' ? 'py-2 px-3 text-sm' : 'py-2.5 px-3.5 text-sm';

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-2 bg-white border rounded-lg cursor-pointer transition-all whitespace-nowrap
          ${open ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-200 hover:border-slate-300'}
          ${heightCls}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selected?.dot && (
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selected.dot}`}></span>
          )}
          {selected?.icon && (
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <i className={`${selected.icon} text-slate-500 text-xs`}></i>
            </div>
          )}
          <span className={`truncate ${selected ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
            {selected?.label ?? placeholder}
          </span>
        </div>
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          <i className={`ri-arrow-down-s-line text-slate-400 text-base transition-transform duration-200 ${open ? 'rotate-180' : ''}`}></i>
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-full min-w-max bg-white border border-slate-200 rounded-xl py-1.5 overflow-hidden"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {options.map((opt) => {
            const isActive = opt.value === value || opt.label === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value || opt.label); close(); }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm cursor-pointer transition-colors text-left
                  ${isActive
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {/* Dot indicator */}
                {opt.dot && (
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`}></span>
                )}
                {/* Icon */}
                {opt.icon && (
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className={`${opt.icon} text-sm ${isActive ? 'text-brand-500' : 'text-slate-400'}`}></i>
                  </div>
                )}
                {/* Label + meta */}
                <div className="flex-1 min-w-0">
                  <span className="truncate">{opt.label}</span>
                  {opt.meta && (
                    <span className="ml-2 text-xs text-slate-400">{opt.meta}</span>
                  )}
                </div>
                {/* Check */}
                {isActive && (
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    <i className="ri-check-line text-brand-500 text-sm"></i>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
