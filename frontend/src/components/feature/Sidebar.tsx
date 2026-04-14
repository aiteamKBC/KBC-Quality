import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  active: boolean;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'ri-dashboard-3-line', active: true },
  { path: '/ofsted', label: 'Ofsted Readiness', icon: 'ri-shield-star-line', active: false },
  { path: '/learners', label: 'Learners', icon: 'ri-user-3-line', active: true },
  { path: '/employers', label: 'Employers', icon: 'ri-building-2-line', active: true },
  { path: '/evidence', label: 'Evidence Vault', icon: 'ri-archive-drawer-line', active: true },
  { path: '/actions', label: 'Actions', icon: 'ri-task-line', active: true },
  { path: '/safeguarding', label: 'Safeguarding', icon: 'ri-heart-pulse-line', active: false },
  { path: '/quality', label: 'Quality', icon: 'ri-bar-chart-grouped-line', active: false },
  { path: '/compliance', label: 'Compliance', icon: 'ri-file-list-3-line', active: false },
  { path: '/reports', label: 'Reports', icon: 'ri-file-chart-line', active: false },
  { path: '/settings', label: 'Settings', icon: 'ri-settings-3-line', active: false },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeItems = navItems.filter((n) => n.active);
  const comingSoonItems = navItems.filter((n) => !n.active);

  return (
    <aside className="w-56 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center flex-shrink-0">
            <i className="ri-shield-check-line text-white text-sm"></i>
          </div>
          <div>
            <div className="text-white text-xs font-bold leading-tight">KBC Quality</div>
            <div className="text-slate-400 text-xs leading-tight">Ofsted Platform</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {/* Active modules */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1.5">Modules</p>
          <div className="space-y-0.5">
            {activeItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${isActive ? 'bg-brand-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-base`}></i>
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coming soon modules */}
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1.5">Coming Soon</p>
          <div className="space-y-0.5">
            {comingSoonItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer text-slate-600 hover:text-slate-400 hover:bg-slate-800/50"
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 opacity-50">
                  <i className={`${item.icon} text-base`}></i>
                </div>
                <span className="opacity-50">{item.label}</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 animate-pulse"></span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-700">
        <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 text-xs">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-circle-fill text-emerald-400 text-xs"></i>
          </div>
          <span>Kent Business College</span>
        </div>
      </div>
    </aside>
  );
}
