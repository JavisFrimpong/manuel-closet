import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, LogIn, UserPlus, Loader2, Shield, Sparkles, KeyRound, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset-password';

function isRecoveryUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const { hash, search } = window.location;
  return hash.includes('type=recovery') || search.includes('type=recovery');
}

export interface AdminLoginProps {
  /** When true, user arrived from a password reset link and should set a new password (even though they have a temporary session). */
  passwordRecoveryFlow?: boolean;
  /** Called after password is updated successfully so the app can leave recovery routing. */
  onPasswordRecoveryFinished?: () => void;
}

const AdminLogin = ({ passwordRecoveryFlow = false, onPasswordRecoveryFinished }: AdminLoginProps) => {
  const [mode, setMode] = useState<AuthMode>(() =>
    passwordRecoveryFlow || isRecoveryUrl() ? 'reset-password' : 'login',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (passwordRecoveryFlow || isRecoveryUrl()) {
      setMode('reset-password');
      setError(null);
      setSuccess(null);
    }
  }, [passwordRecoveryFlow]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset-password');
        setError(null);
        setSuccess(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const goLogin = () => {
    setMode('login');
    setError(null);
    setSuccess(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!email.trim()) {
        setError('Enter the email for your admin account.');
        return;
      }
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin`,
      });
      if (resetErr) throw resetErr;
      setSuccess('If an account exists for this email, you will receive a password reset link shortly.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;
      setSuccess('Password updated. Sign in with your new password.');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/admin');
      }
      await supabase.auth.signOut();
      onPasswordRecoveryFinished?.();
      goLogin();
      setPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      await handleForgotSubmit(e);
      return;
    }
    if (mode === 'reset-password') {
      await handleResetSubmit(e);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        if (data.user && !data.user.email_confirmed_at) {
          try {
            await supabase.functions.invoke('confirm-user', {
              body: { userId: data.user.id },
            });
          } catch (confirmErr) {
            console.warn('Auto-confirm failed:', confirmErr);
          }
        }

        setSuccess('Account created! You can now log in.');
        setMode('login');
        setPassword('');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const showTabs = mode === 'login' || mode === 'signup';

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-600/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-2xl shadow-brand-500/40 mb-4">
            <Shield className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white font-serif">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Manuel's Closet Management</p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-2xl">
          {showTabs && (
            <div className="flex bg-dark-700 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'login' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'signup' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={goLogin}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </button>
          )}

          {mode === 'reset-password' && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-brand-400 mb-2">
                <KeyRound size={20} />
                <span className="text-sm font-semibold uppercase tracking-wide">Set new password</span>
              </div>
              <p className="text-gray-500 text-sm">Choose a new password for your admin account.</p>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white mb-1">Forgot password</h2>
              <p className="text-gray-500 text-sm">We will email you a link to reset your password.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1.5 block">Email</label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@manuelscloset.com"
                  required
                  autoComplete="email"
                  className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-gray-400 text-sm font-medium">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                      className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 pr-12 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'reset-password' && (
              <>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1.5 block">New password</label>
                  <input
                    id="admin-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1.5 block">Confirm password</label>
                  <input
                    id="admin-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? 'Hide passwords' : 'Show passwords'}
                </button>
              </>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3 animate-fade-in">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl p-3 flex items-center gap-2 animate-fade-in">
                <Sparkles size={16} />
                {success}
              </div>
            )}

            <button
              type="submit"
              id="admin-submit-btn"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98] mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : mode === 'forgot' ? (
                <KeyRound size={18} />
              ) : mode === 'reset-password' ? (
                <KeyRound size={18} />
              ) : mode === 'login' ? (
                <LogIn size={18} />
              ) : (
                <UserPlus size={18} />
              )}
              {loading
                ? 'Please wait...'
                : mode === 'forgot'
                  ? 'Send reset link'
                  : mode === 'reset-password'
                    ? 'Update password'
                    : mode === 'login'
                      ? 'Sign In'
                      : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          This portal is restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
