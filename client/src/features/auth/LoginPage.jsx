import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'front_desk') navigate('/desk/calendar');
      else if (user.role === 'staff') navigate('/staff/shop-pos');
      else navigate('/member/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#C8102E] text-white rounded-xl mx-auto flex items-center justify-center font-extrabold text-xl mb-3 shadow">
            CC
          </div>
          <h2 className="text-xl font-bold text-[#111111] uppercase tracking-tight">Champions Club Login</h2>
          <p className="text-xs text-neutral-500 mt-1">Sign in with your club membership or staff credentials</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@championsclub.com"
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-[#C8102E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-[#C8102E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8102E] hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg text-sm shadow transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <span className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center mb-3">
            Quick Demo Fill (Password: Password123!)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoAccount('admin@championsclub.com')}
              className="p-2 border border-neutral-200 rounded text-neutral-700 hover:bg-neutral-50 text-left"
            >
              👑 <span className="font-semibold">Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('desk@championsclub.com')}
              className="p-2 border border-neutral-200 rounded text-neutral-700 hover:bg-neutral-50 text-left"
            >
              📋 <span className="font-semibold">Front Desk</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('staff@championsclub.com')}
              className="p-2 border border-neutral-200 rounded text-neutral-700 hover:bg-neutral-50 text-left"
            >
              ☕ <span className="font-semibold">Staff (POS)</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('alex@example.com')}
              className="p-2 border border-neutral-200 rounded text-neutral-700 hover:bg-neutral-50 text-left"
            >
              🎾 <span className="font-semibold">Gold Member</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
