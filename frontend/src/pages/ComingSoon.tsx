import AppLayout from '@/components/feature/AppLayout';

interface ComingSoonProps {
  title: string;
  icon: string;
  description: string;
  features: string[];
  eta?: string;
}

export default function ComingSoon({ title, icon, description, features, eta }: ComingSoonProps) {
  return (
    <AppLayout title={title}>
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="max-w-lg w-full text-center">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            In Development
          </div>

          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <i className={`${icon} text-4xl text-slate-400`}></i>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">{description}</p>

          {/* Planned features */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-left mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Planned Features</p>
            <ul className="space-y-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <i className="ri-time-line text-slate-400 text-xs"></i>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {eta && (
            <p className="text-xs text-slate-400">
              Expected release: <span className="text-slate-600 font-medium">{eta}</span>
            </p>
          )}

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="btn-secondary flex items-center gap-1.5"
            >
              <i className="ri-arrow-left-line text-xs"></i> Go Back
            </button>
            <button className="btn-primary flex items-center gap-1.5">
              <i className="ri-notification-3-line text-xs"></i> Notify Me
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
