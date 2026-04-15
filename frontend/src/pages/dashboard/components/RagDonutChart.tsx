import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

interface Props {
  ragDistribution: {
    Green: number;
    Amber: number;
    Red: number;
  };
}

interface TooltipPayload {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  total: number;
}

function CustomTooltip({ active, payload, total }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">
      <p className="font-semibold">{point.name}: {point.value} learners</p>
      <p className="text-slate-400">{total > 0 ? Math.round((point.value / total) * 100) : 0}% of cohort</p>
    </div>
  );
}

export default function RagDonutChart({ ragDistribution }: Props) {
  const navigate = useNavigate();
  const data = [
    { name: "Green", value: ragDistribution.Green, color: "#10b981" },
    { name: "Amber", value: ragDistribution.Amber, color: "#f59e0b" },
    { name: "Red", value: ragDistribution.Red, color: "#ef4444" },
  ];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex h-full flex-col">
      <div
        className="relative min-h-0 flex-1 [&_.recharts-surface]:border-0 [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:border-0 [&_.recharts-wrapper]:outline-none"
        style={{ height: 160 }}
      >
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 space-y-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="flex-1 text-xs text-slate-500">{entry.name}</span>
            <span className="text-xs font-bold text-slate-800">{entry.value}</span>
            <span className="w-8 text-right text-xs text-slate-400">{total > 0 ? Math.round((entry.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <button onClick={() => navigate("/learners")} className="w-full cursor-pointer text-center text-xs text-brand-600 hover:underline">
          View all learners &rarr;
        </button>
      </div>
    </div>
  );
}
