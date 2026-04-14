import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface TopHeaderProps {
  title?: string;
}

export default function TopHeader({ title }: TopHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifications = [
    { id: 1, text: 'Marcus Reid review is 6 weeks overdue', type: 'red', time: '2h ago' },
    { id: 2, text: 'Ryan Patel attendance dropped to 65%', type: 'red', time: '4h ago' },
    { id: 3, text: 'Boots UK - 3 unsigned progress reviews', type: 'amber', time: '1d ago' },
    { id: 4, text: 'New safeguarding case opened', type: 'amber', time: '2d ago' },
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
      {title && <h1 className="text-sm font-semibold text-slate-800 hidden lg:block">{title}</h1>}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <i className="ri-search-line text-slate-400 text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Search learners, employers, evidence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <i className="ri-notification-3-line text-slate-500"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                <span className="text-xs text-brand-600 cursor-pointer">Mark all read</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'red' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-700">{n.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-white text-xs font-semibold">
              {user?.initials || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-medium text-slate-800 leading-tight">{user?.full_name}</div>
              <div className="text-xs text-slate-400 leading-tight">{user?.role}</div>
            </div>
            <i className="ri-arrow-down-s-line text-slate-400 text-xs"></i>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-xs font-medium text-slate-800">{user?.full_name}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <i className="ri-user-line text-slate-400"></i> Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <i className="ri-settings-3-line text-slate-400"></i> Settings
              </button>
              <div className="border-t border-slate-100"></div>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                <i className="ri-logout-box-line"></i> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
