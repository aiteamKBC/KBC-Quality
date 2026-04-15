interface Props {
  progress: number;
  completedComponents: number;
  totalComponents: number;
  completedKsb: number;
  totalKsb: number;
}

export default function LearnerProgressChart({
  progress,
  completedComponents,
  totalComponents,
  completedKsb,
  totalKsb,
}: Props) {
  const safeComponentTotal = totalComponents > 0 ? totalComponents : 0;
  const safeKsbTotal = totalKsb > 0 ? totalKsb : 0;
  const remainingComponents = Math.max(0, safeComponentTotal - completedComponents);
  const ksbPct = safeKsbTotal > 0 ? Math.round((completedKsb / safeKsbTotal) * 100) : 0;

  return (
    <div className="space-y-4 py-3">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Programme completion</span>
          <span className="font-semibold text-slate-800">{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-400">Components</div>
          <div className="mt-1 text-lg font-bold text-slate-800">
            {completedComponents}/{safeComponentTotal}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${safeComponentTotal > 0 ? (completedComponents / safeComponentTotal) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-slate-400">{remainingComponents} remaining</div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-400">KSB coverage</div>
          <div className="mt-1 text-lg font-bold text-slate-800">
            {completedKsb}/{safeKsbTotal}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(ksbPct, 100)}%` }}></div>
          </div>
          <div className="mt-1 text-xs text-slate-400">{ksbPct}% complete</div>
        </div>
      </div>
    </div>
  );
}
