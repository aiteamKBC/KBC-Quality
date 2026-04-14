import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props {
  progress: number;
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
      <p className="text-emerald-300">Progress: {payload[0].value}%</p>
    </div>
  );
}

export default function LearnerProgressChart({ progress }: Props) {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const data = months.map((month, i) => ({
    month,
    progress: Math.min(100, Math.round((progress / (months.length - 1)) * i + (Math.sin(i) * 3))),
    expected: Math.round((100 / (months.length - 1)) * i),
  }));
  // Ensure last point matches actual progress
  data[data.length - 1].progress = progress;

  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 5, right: 4, left: -26, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={50} stroke="#f1f5f9" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="expected" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        <Line type="monotone" dataKey="progress" stroke="#10b981" strokeWidth={2.5}
          dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#10b981' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
