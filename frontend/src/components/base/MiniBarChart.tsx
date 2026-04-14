interface DataPoint {
  month: string;
  value: number;
}

interface MiniBarChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  showLabels?: boolean;
}

export default function MiniBarChart({ data, color = '#6272f3', height = 60, showLabels = true }: MiniBarChartProps) {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value)) - 5;
  const range = max - min || 1;

  return (
    <div className="w-full">
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d) => {
          const barHeight = ((d.value - min) / range) * (height - 16);
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {d.value}%
              </div>
              <div
                className="w-full rounded-sm transition-all"
                style={{ height: barHeight, backgroundColor: color, opacity: 0.85 }}
              ></div>
            </div>
          );
        })}
      </div>
      {showLabels && (
        <div className="flex gap-1 mt-1">
          {data.map((d) => (
            <div key={d.month} className="flex-1 text-center text-xs text-slate-400">{d.month}</div>
          ))}
        </div>
      )}
    </div>
  );
}
