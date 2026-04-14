import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { mockLearners } from '@/mocks/learners';

const programmes = ['L3 Business Admin', 'L2 Customer Service', 'L3 Team Leader', 'L4 Project Mgmt'];
const fullNames = ['L3 Business Administration', 'L2 Customer Service', 'L3 Team Leader', 'L4 Project Management'];

const data = programmes.map((short, i) => {
  const pl = mockLearners.filter((l) => l.programme === fullNames[i]);
  return {
    name: short,
    attendance: pl.length ? Math.round(pl.reduce((s, l) => s + l.attendance_pct, 0) / pl.length) : 0,
    otjh: pl.length ? Math.round(pl.reduce((s, l) => s + (l.otjh_logged / l.otjh_target) * 100, 0) / pl.length) : 0,
  };
});

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg space-y-1">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}%</p>
      ))}
    </div>
  );
}

export default function ProgrammeBarChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 4, left: -24, bottom: 0 }} barSize={12} barGap={3}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#64748b', paddingTop: 8 }}
          iconType="circle"
          iconSize={7}
        />
        <Bar dataKey="attendance" name="Attendance" fill="#f59e0b" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill="#f59e0b" />)}
        </Bar>
        <Bar dataKey="otjh" name="OTJH %" fill="#6272f3" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill="#6272f3" />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
