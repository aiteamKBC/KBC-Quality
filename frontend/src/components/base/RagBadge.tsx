interface RagBadgeProps {
  status: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export default function RagBadge({ status, showDot = true, size = 'sm' }: RagBadgeProps) {
  const classes: Record<string, string> = {
    Green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    Red: 'bg-red-50 text-red-700 border border-red-200',
  };
  const dotClasses: Record<string, string> = {
    Green: 'bg-emerald-500',
    Amber: 'bg-amber-400',
    Red: 'bg-red-500',
  };
  const cls = classes[status] || classes.Amber;
  const dotCls = dotClasses[status] || dotClasses.Amber;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${textSize} ${cls}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotCls}`}></span>}
      {status}
    </span>
  );
}
