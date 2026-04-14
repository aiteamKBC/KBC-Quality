import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { mockRagBreakdown } from '@/mocks/dashboard';

const data = [
  { name: 'Green', value: mockRagBreakdown.green, color: '#10b981' },
  { name: 'Amber', value: mockRagBreakdown.amber, color: '#f59e0b' },
  { name: 'Red', value: mockRagBreakdown.red, color: '#ef4444' },
];

const total = data.reduce((s, d) => s + d.value, 0);

interface TooltipPayload {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg">
      <p className="font-semibold">{d.name}: {d.value} learners</p>
      <p className="text-slate-400">{Math.round((d.value / total) * 100)}% of cohort</p>
    </div>
  );
}

export default function RagDonutChart() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-0" style={{ height: 160 }}>
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
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-400">Learners</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></span>
            <span className="text-xs text-slate-500 flex-1">{d.name}</span>
            <span className="text-xs font-bold text-slate-800">{d.value}</span>
            <span className="text-xs text-slate-400 w-8 text-right">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={() => navigate('/learners')}
          className="text-xs text-brand-600 hover:underline cursor-pointer w-full text-center"
        >
          View all learners &rarr;
        </button>
      </div>
    </div>
  );
}
