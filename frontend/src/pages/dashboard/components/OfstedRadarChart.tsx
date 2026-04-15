import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DashboardOfstedTheme } from "@/types/dashboard";

interface Props {
  data: DashboardOfstedTheme[];
}

interface TooltipPayload {
  payload: { subject: string; score: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">
      <p className="font-semibold">{point.subject.replace("\n", " ")}</p>
      <p className="text-brand-300">{point.score}% ready</p>
    </div>
  );
}

export default function OfstedRadarChart({ data }: Props) {
  const chartData = data.map((item) => ({
    subject: item.theme.replace(" & ", " &\n").replace("Leadership & Management", "Leadership"),
    score: item.score,
    fullMark: 100,
  }));

  if (chartData.length === 0) {
    return <div className="py-10 text-center text-sm text-slate-400">No Ofsted readiness signals available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
        <Radar name="Readiness" dataKey="score" stroke="#6272f3" fill="#6272f3" fillOpacity={0.15} strokeWidth={2} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
