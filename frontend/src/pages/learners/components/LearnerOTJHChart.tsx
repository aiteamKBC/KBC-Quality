interface Props {
  logged: number;
  target: number;
}

export default function LearnerOTJHChart({ logged, target }: Props) {
  const safeTarget = target > 0 ? target : 0;
  const pct = safeTarget > 0 ? Math.min(100, Math.round((logged / safeTarget) * 100)) : 0;
  const remaining = Math.max(0, safeTarget - logged);
  const color = pct >= 85 ? "bg-brand-500" : pct >= 70 ? "bg-amber-400" : "bg-red-500";

  return (
    <div className="space-y-4 py-3">
      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-lg font-bold text-slate-800">{logged}h</div>
          <div className="text-xs text-slate-400">Logged</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-lg font-bold text-slate-800">{safeTarget}h</div>
          <div className="text-xs text-slate-400">Target</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className={`text-lg font-bold ${remaining > 0 ? "text-amber-600" : "text-emerald-600"}`}>{remaining}h</div>
          <div className="text-xs text-slate-400">Remaining</div>
        </div>
      </div>
    </div>
  );
}
