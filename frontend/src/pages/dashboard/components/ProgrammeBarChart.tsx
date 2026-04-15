import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardProgrammePerformance } from "@/types/dashboard";

interface Props {
  data: DashboardProgrammePerformance[];
}

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

function shorten(name: string) {
  return name.length > 24 ? `${name.slice(0, 21)}...` : name;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="space-y-1 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((point) => (
        <p key={point.name} style={{ color: point.color }}>
          {point.name}: {point.value}%
        </p>
      ))}
    </div>
  );
}

export default function ProgrammeBarChart({ data }: Props) {
  const chartData = data.map((item) => ({
    ...item,
    short_name: shorten(item.name),
  }));

  if (chartData.length === 0) {
    return <div className="py-10 text-center text-sm text-slate-400">No programme performance data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 5, right: 4, left: -24, bottom: 0 }} barSize={12} barGap={3}>
        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="short_name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 100]} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 8 }} iconType="circle" iconSize={7} />
        <Bar dataKey="attendance" name="Attendance" fill="#f59e0b" radius={[3, 3, 0, 0]}>
          {chartData.map((item) => <Cell key={`attendance-${item.name}`} fill="#f59e0b" />)}
        </Bar>
        <Bar dataKey="otjh" name="OTJH %" fill="#6272f3" radius={[3, 3, 0, 0]}>
          {chartData.map((item) => <Cell key={`otjh-${item.name}`} fill="#6272f3" />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
