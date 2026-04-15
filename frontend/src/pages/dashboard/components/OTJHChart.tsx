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
import type { DashboardTrendPoint } from "@/types/dashboard";

interface Props {
  data: DashboardTrendPoint[];
}

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
    <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((point) => (
        <p key={point.name} className={point.name === "target" ? "text-slate-400" : "text-brand-300"}>
          {point.name === "target" ? "Target" : "OTJH"}: {point.value}%
        </p>
      ))}
    </div>
  );
}

export default function OTJHChart({ data }: Props) {
  if (data.length === 0) {
    return <div className="py-10 text-center text-sm text-slate-400">No OTJH trend available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 5, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="otjhGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6272f3" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6272f3" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 100]} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={80} stroke="#e2e8f0" strokeDasharray="4 4" />
        <Area type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={1.5} fill="none" strokeDasharray="4 4" dot={false} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#6272f3"
          strokeWidth={2.5}
          fill="url(#otjhGrad)"
          dot={{ fill: "#6272f3", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#6272f3" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
