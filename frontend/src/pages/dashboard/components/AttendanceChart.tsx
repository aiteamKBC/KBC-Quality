import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { mockAttendanceTrend } from '@/mocks/dashboard';

const data = mockAttendanceTrend.map((d) => ({ ...d, target: 90 }));

interface TooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
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

export default function AttendanceChart() {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 5, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[80, 100]} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={90} stroke="#e2e8f0" strokeDasharray="4 4" />
        <Area
          type="monotone" dataKey="target" stroke="#e2e8f0"
          strokeWidth={1.5} fill="none" strokeDasharray="4 4" dot={false}
        />
        <Area
          type="monotone" dataKey="value" stroke="#f59e0b"
          strokeWidth={2.5} fill="url(#attendanceGrad)"
          dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#f59e0b' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
