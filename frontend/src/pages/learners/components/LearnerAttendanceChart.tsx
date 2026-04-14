import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface Props {
  attendancePct: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className={p.name === 'target' ? 'text-slate-400' : 'text-amber-300'}>
          {p.name === 'target' ? 'Target' : 'Attendance'}: {p.value}%
        </p>
      ))}
    </div>
  );
}

export default function LearnerAttendanceChart({ attendancePct }: Props) {
  // Generate per-month data with realistic variation around the learner's actual %
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const base = attendancePct;
  const data = months.map((month, i) => ({
    month,
    value: Math.min(100, Math.max(50, base + (Math.sin(i * 1.2) * 6) + (i < 3 ? -4 : i > 6 ? 3 : 0))),
    target: 90,
  })).map((d) => ({ ...d, value: Math.round(d.value) }));

  const color = attendancePct >= 90 ? '#10b981' : attendancePct >= 80 ? '#f59e0b' : '#ef4444';
  const gradId = `attGrad-${attendancePct}`;

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 5, right: 4, left: -26, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[50, 100]} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={90} stroke="#e2e8f0" strokeDasharray="4 4" />
        <Area type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={1.5} fill="none" strokeDasharray="4 4" dot={false} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#${gradId})`}
          dot={{ fill: color, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: color }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
