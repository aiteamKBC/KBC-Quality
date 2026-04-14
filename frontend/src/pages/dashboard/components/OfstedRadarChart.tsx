import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { mockOfstedThemes } from '@/mocks/dashboard';

const data = mockOfstedThemes.map((t) => ({
  subject: t.theme.replace(' & ', ' &\n').replace('Leadership & Management', 'Leadership'),
  score: t.score,
  fullMark: 100,
}));

interface TooltipPayload {
  payload: { subject: string; score: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg">
      <p className="font-semibold">{d.subject.replace('\n', ' ')}</p>
      <p className="text-brand-300">{d.score}% ready</p>
    </div>
  );
}

export default function OfstedRadarChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 10, fill: '#64748b' }}
        />
        <Radar
          name="Readiness"
          dataKey="score"
          stroke="#6272f3"
          fill="#6272f3"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
