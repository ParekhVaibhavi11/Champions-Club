import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

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
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-champion-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-champion-red rounded-xl text-white font-black text-2xl shadow-lg mb-3">
          CC
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">
          Set New Password
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Enter and confirm your new secure account password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl border border-gray-200 sm:px-10">
          
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-black text-champion-dark uppercase">
                Password Reset Successful!
              </h3>
              <p className="text-xs text-gray-500">
                You can now log in with your updated credentials.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
                className="w-full uppercase font-bold"
              >
                Proceed to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                  {error}
                </div>
              )}

              <Input
                label="New Password"
                type="password"
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={Lock}
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={Lock}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full flex items-center justify-center font-black uppercase text-sm shadow-md"
                >
                  {loading ? 'Updating Password...' : 'Save New Password'}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>

              <div className="pt-2 text-center">
                <Link to="/login" className="text-xs font-semibold text-gray-500 hover:text-champion-dark inline-flex items-center">
                  Sign In
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
