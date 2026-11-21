import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Mail, Lock, ArrowRight, UserCheck, Flame, ArrowLeft, Shield } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectByRole = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'front_desk':
        navigate('/desk/calendar', { replace: true });
        break;
      case 'staff':
        navigate('/staff/shop-pos', { replace: true });
        break;
      case 'member':
        navigate('/member/dashboard', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(demoEmail, 'Password123!');
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Admin (Club Owner)', email: 'owner@championsclub.com', role: 'admin', desc: 'Full KPIs & financial ledger', badge: 'Admin' },
    { label: 'Front Desk Officer', email: 'desk@championsclub.com', role: 'front_desk', desc: 'Court grid & walk-in check-in', badge: 'Desk' },
    { label: 'Gear Shop Staff', email: 'shop@championsclub.com', role: 'staff', desc: 'Pro shop checkout & stock', badge: 'Shop' },
    { label: 'Café & Kitchen Staff', email: 'cafe@championsclub.com', role: 'staff', desc: 'Table tabs & kitchen display', badge: 'Café' },
    { label: 'Gold Member (VIP)', email: 'gold.member@championsclub.com', role: 'member', desc: '100% free courts & 20% shop off', badge: 'Member' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-champion-dark">
      
      {/* Background athlete texture */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20 pointer-events-none filter blur-[1px]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-champion-dark via-champion-dark/90 to-transparent pointer-events-none" />

      {/* Main Responsive Container */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch shadow-2xl rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/90 backdrop-blur-xl">
        
        {/* Left Side: Brand & Quick Demo Access */}
        <div className="lg:col-span-5 bg-black/60 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-800">
          <div>
            <Link to="/" className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Arenas
            </Link>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-champion-red rounded-lg flex items-center justify-center font-black text-xl text-white shadow-lg">
                CC
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Champions<span className="text-champion-red">Club</span>
                </h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Role Access Portal</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Select any pre-configured demo account below to test specific permissions, role views, and workflows.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <span className="flex items-center text-champion-red">
                  <Flame className="w-3.5 h-3.5 mr-1" /> 1-Click Role Login
                </span>
                <span className="font-mono text-gray-500">Pwd: Password123!</span>
              </div>

              {demoAccounts.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleDemoLogin(demo.email)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-lg border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-between group active:scale-[0.99]"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white group-hover:text-champion-red transition-colors">
                      {demo.label}
                    </span>
                    <span className="text-[10px] text-gray-400">{demo.desc}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-gray-300 border border-neutral-700">
                    {demo.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-neutral-800/80 text-[10px] text-gray-500 flex items-center justify-between">
            <span>PostgreSQL GiST Protected</span>
            <Shield className="w-3.5 h-3.5 text-champion-red" />
          </div>
        </div>

        {/* Right Side: Manual Credential Login */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-champion-dark uppercase tracking-tight">
              Sign In
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Enter your club credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center">
              <span className="font-bold mr-1">Error:</span> {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. owner@championsclub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
            />

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full flex items-center justify-center font-extrabold tracking-wider uppercase text-sm shadow-md"
              >
                {loading ? 'Validating Token...' : 'Enter Champions Portal'}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            For new athlete memberships or court reservations, please see Front Desk or click any quick role chip on the left.
          </p>
        </div>

      </div>

    </div>
  );
};
