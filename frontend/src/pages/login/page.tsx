import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://readdy.ai/api/search-image?query=modern%20professional%20office%20building%20interior%20with%20clean%20minimalist%20architecture%20large%20windows%20natural%20light%20corporate%20environment%20calm%20sophisticated%20tones%20no%20people&width=800&height=900&seq=kbc-login-bg&orientation=portrait')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-brand-950/70" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
              <i className="ri-shield-check-line text-white text-lg"></i>
            </div>
            <div>
              <div className="text-white font-bold text-sm">Kent Business College</div>
              <div className="text-slate-300 text-xs">Internal Platform</div>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Quality &amp; Ofsted<br />Readiness Platform
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            One unified workspace for learner progress, employer engagement, safeguarding, compliance, and inspection readiness.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'ri-user-3-line', label: 'Learner 360', desc: 'Full learner profiles' },
              { icon: 'ri-shield-star-line', label: 'Ofsted Ready', desc: 'Inspection dashboard' },
              { icon: 'ri-bar-chart-grouped-line', label: 'Quality KPIs', desc: 'Live performance data' },
              { icon: 'ri-archive-drawer-line', label: 'Evidence Vault', desc: 'Centralised evidence' },
            ].map((f) => (
              <div key={f.label} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="w-8 h-8 flex items-center justify-center mb-2">
                  <i className={`${f.icon} text-brand-300 text-lg`}></i>
                </div>
                <div className="text-white text-xs font-semibold">{f.label}</div>
                <div className="text-slate-400 text-xs">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-slate-500 text-xs">
          &copy; 2024 Kent Business College. Internal use only.
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center">
              <i className="ri-shield-check-line text-white text-sm"></i>
            </div>
            <span className="font-bold text-slate-800 text-sm">KBC Quality Platform</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h1>
          <p className="text-slate-500 text-sm mb-8">Access your KBC quality dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@kentbc.ac.uk"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-slate-50"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-xs text-brand-600 cursor-pointer hover:underline">Forgot password?</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-slate-50"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <i className="ri-error-warning-line text-red-500"></i>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-700 hover:bg-brand-800 text-white font-medium py-2.5 rounded-md text-sm transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold mb-2">Demo access</p>
            <p className="text-xs text-slate-400">Use any email and password to access the demo platform.</p>
            <button
              onClick={() => { setEmail('sarah.mitchell@kentbc.ac.uk'); setPassword('demo1234'); }}
              className="mt-2 text-xs text-brand-600 hover:underline cursor-pointer"
            >
              Fill demo credentials
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-6">
            For access issues contact <span className="text-brand-600">admin@kentbc.ac.uk</span>
          </p>
        </div>
      </div>
    </div>
  );
}
