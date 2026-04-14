import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

interface Props {
  logged: number;
  target: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg">
      <p className="font-semibold">{label}</p>
      <p className="text-brand-300">{payload[0].value}h logged</p>
    </div>
  );
}

export default function LearnerOTJHChart({ logged, target }: Props) {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const totalMonths = months.length;
  const monthlyTarget = Math.round(target / 12);

  // Distribute hours across months with realistic variation
  const distributed = months.map((month, i) => {
    const proportion = logged / target;
    const base = Math.round((logged / totalMonths) * (0.8 + Math.random() * 0.4));
    const isRecent = i >= totalMonths - 2;
    return { month, hours: Math.max(0, isRecent && proportion < 0.8 ? Math.round(base * 0.6) : base) };
  });

  const maxHours = Math.max(...distributed.map((d) => d.hours), monthlyTarget);

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={distributed} margin={{ top: 5, right: 4, left: -26, bottom: 0 }} barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, maxHours + 5]} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={monthlyTarget} stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: `${monthlyTarget}h/mo`, position: 'right', fontSize: 9, fill: '#94a3b8' }} />
        <Bar dataKey="hours" radius={[3, 3, 0, 0]}>
          {distributed.map((d, i) => (
            <Cell key={i} fill={d.hours >= monthlyTarget ? '#6272f3' : d.hours >= monthlyTarget * 0.75 ? '#f59e0b' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
