import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AttendanceHistoryPoint } from "@/types/learners";

interface Props {
  history: AttendanceHistoryPoint[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">
      <p className="mb-1 font-semibold">{label}</p>
      <p className="text-amber-300">Attendance: {payload[0].value}%</p>
    </div>
  );
}

export default function LearnerAttendanceChart({ history }: Props) {
  const chartData = history.map((item) => ({
    month: item.label,
    attendance: Math.round(item.attendance_pct),
    target: 90,
  }));

  if (chartData.length === 0) {
    return <div className="py-10 text-center text-sm text-slate-400">No attendance records found</div>;
  }

  const latest = chartData[chartData.length - 1]?.attendance ?? 0;
  const color = latest >= 90 ? "#10b981" : latest >= 80 ? "#f59e0b" : "#ef4444";

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={chartData} margin={{ top: 5, right: 4, left: -26, bottom: 0 }}>
        <defs>
          <linearGradient id="learner-attendance-real" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 100]} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={90} stroke="#e2e8f0" strokeDasharray="4 4" />
        <Area type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={1.5} fill="none" strokeDasharray="4 4" dot={false} />
        <Area
          type="monotone"
          dataKey="attendance"
          stroke={color}
          strokeWidth={2.5}
          fill="url(#learner-attendance-real)"
          dot={{ fill: color, r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
