import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, LogIn, UserPlus, Loader2, Shield, Sparkles } from 'lucide-react';

const AdminLogin = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange in App.tsx handles the redirect automatically
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
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-600/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-2xl shadow-brand-500/40 mb-4">
            <Shield className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white font-serif">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Manuel's Closet Management</p>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm font-medium mb-1.5 block">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@manuelscloset.com"
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
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
              ) : mode === 'login' ? (
                <LogIn size={18} />
              ) : (
                <UserPlus size={18} />
              )}
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
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
