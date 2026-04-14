interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  status?: 'Green' | 'Amber' | 'Red' | 'neutral';
  icon: string;
  suffix?: string;
}

const statusBar: Record<string, string> = {
  Green: 'bg-emerald-500',
  Amber: 'bg-amber-400',
  Red: 'bg-red-500',
  neutral: 'bg-slate-300',
};

const statusIcon: Record<string, string> = {
  Green: 'bg-emerald-50 text-emerald-600',
  Amber: 'bg-amber-50 text-amber-600',
  Red: 'bg-red-50 text-red-600',
  neutral: 'bg-slate-100 text-slate-500',
};

export default function KpiCard({ title, value, trend, trendUp, status = 'neutral', icon, suffix }: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col gap-3 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-md flex items-center justify-center ${statusIcon[status]}`}>
          <i className={`${icon} text-base`}></i>
        </div>
        {trend && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${trendUp === false ? 'text-red-500' : trendUp === true ? 'text-emerald-600' : 'text-slate-400'}`}>
            {trendUp === true && <i className="ri-arrow-up-s-line"></i>}
            {trendUp === false && <i className="ri-arrow-down-s-line"></i>}
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">
          {value}{suffix && <span className="text-base font-medium text-slate-400 ml-0.5">{suffix}</span>}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{title}</div>
      </div>
      {status !== 'neutral' && (
        <div className="h-0.5 rounded-full bg-slate-100">
          <div className={`h-0.5 rounded-full ${statusBar[status]}`} style={{ width: status === 'Green' ? '80%' : status === 'Amber' ? '50%' : '20%' }}></div>
        </div>
      )}
    </div>
  );
}
