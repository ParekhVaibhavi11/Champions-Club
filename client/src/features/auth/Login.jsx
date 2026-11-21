import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  UserCheck, 
  Flame, 
  ArrowLeft, 
  Shield, 
  User, 
  Phone,
  KeyRound,
  CheckCircle,
  HelpCircle,
  Hash
} from 'lucide-react';

export const Login = () => {
  // Mode: 'login' | 'signup' | 'forgot' | 'verify-otp'
  const [mode, setMode] = useState('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // OTP Fields
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
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

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
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

  const handleSignupSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const newUser = await register({
        fullName,
        email,
        password,
        phone,
      });
      redirectByRole(newUser.role);
    } catch (err) {
      setError(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setSuccessMsg(res.message || '6-digit verification code sent to your email!');
      setMode('verify-otp');
    } catch (err) {
      setError(err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetWithOtpSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPasswordWithOTP(email, otpCode, newPassword);
      setSuccessMsg(res.message || 'Password reset successful! Please sign in with your new password.');
      setMode('login');
      setPassword('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
    setSuccessMsg('');
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
      
      {/* Background texture */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20 pointer-events-none filter blur-[1px]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-champion-dark via-champion-dark/90 to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch shadow-2xl rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900/90 backdrop-blur-xl">
        
        {/* Left Panel: Brand & Quick Demo Access */}
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
              Use your credentials or 1-click test any role below with active seed permissions.
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

        {/* Right Panel: Interactive Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          
          {/* Navigation Switcher */}
          <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'login' ? 'bg-champion-dark text-white shadow-sm' : 'text-gray-500 hover:text-champion-dark'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'signup' ? 'bg-champion-red text-white shadow-sm' : 'text-gray-500 hover:text-champion-dark'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-champion-dark uppercase tracking-tight">
              {mode === 'login' && 'Sign In to Portal'}
              {mode === 'signup' && 'Create Athlete Account'}
              {mode === 'forgot' && 'Forgot Password'}
              {mode === 'verify-otp' && 'Enter 6-Digit Code'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              {mode === 'login' && 'Enter your club credentials to access your workspace.'}
              {mode === 'signup' && 'Create your account now. You can choose a membership plan later.'}
              {mode === 'forgot' && 'Enter your registered email address to receive your 6-digit verification code.'}
              {mode === 'verify-otp' && `Enter the 6-digit code sent to ${email} and choose your new password.`}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center">
              <span className="font-black mr-1.5">Error:</span> {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-900 font-extrabold">{successMsg}</p>
                <p className="text-emerald-700 font-normal mt-0.5">
                  Check your Gmail inbox or spam folder for your 6-digit reset code.
                </p>
              </div>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="athlete@championsclub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Password <span className="text-champion-red">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                    className="text-xs font-bold text-champion-red hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={Lock}
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full flex items-center justify-center font-extrabold tracking-wider uppercase text-sm shadow-md"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Portal'}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === 'signup' && (
            <form className="space-y-4" onSubmit={handleSignupSubmit}>
              <Input
                label="Full Name"
                required
                placeholder="e.g. Ananya Sen"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={User}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="ananya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                />

                <Input
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={Phone}
                />
              </div>

              <Input
                label="Create Password"
                type="password"
                required
                placeholder="At least 6 characters"
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
                  {loading ? 'Creating Account...' : 'Create Athlete Account'}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD (REQUEST CODE) */}
          {mode === 'forgot' && (
            <form className="space-y-4" onSubmit={handleForgotSubmit}>
              <Input
                label="Registered Email Address"
                type="email"
                required
                placeholder="athlete@championsclub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />

              <div className="pt-3 space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full flex items-center justify-center font-extrabold tracking-wider uppercase text-sm shadow-md"
                >
                  {loading ? 'Sending Code...' : 'Send 6-Digit Code to Gmail'}
                  <KeyRound className="w-4 h-4 ml-2" />
                </Button>

                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-champion-dark text-center"
                >
                  Remembered your password? Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* 4. VERIFY OTP & RESET PASSWORD */}
          {mode === 'verify-otp' && (
            <form className="space-y-4" onSubmit={handleResetWithOtpSubmit}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  6-Digit Verification Code <span className="text-champion-red">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Hash className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="block w-full rounded border border-gray-300 pl-10 px-3 py-2.5 text-base font-mono font-bold tracking-widest text-champion-dark focus:outline-none focus:ring-1 focus:ring-champion-red focus:border-champion-red"
                  />
                </div>
              </div>

              <Input
                label="New Password"
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={Lock}
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={Lock}
              />

              <div className="pt-3 space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full flex items-center justify-center font-extrabold tracking-wider uppercase text-sm shadow-md"
                >
                  {loading ? 'Verifying & Saving...' : 'Confirm & Update Password'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>

                <div className="flex items-center justify-between text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-champion-red hover:underline"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                    className="text-gray-500 hover:text-champion-dark"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
