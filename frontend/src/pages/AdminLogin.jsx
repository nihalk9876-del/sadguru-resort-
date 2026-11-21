import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { api } from '../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.adminLogin(email, password);
      if (res.token) {
        localStorage.setItem('sadguru_admin_token', res.token);
        localStorage.setItem('sadguru_admin_user', JSON.stringify(res.admin));
        navigate('/admin');
      } else {
        throw new Error('Authentication did not return a valid token.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-resort-oliveDeep flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow and subtle elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-resort-olive via-resort-oliveDeep to-black pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-resort-gold/80 hover:text-resort-gold transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Resort Website</span>
        </Link>

        <div className="w-16 h-16 mx-auto mb-4 border border-resort-gold/50 rounded-full flex items-center justify-center bg-resort-olive/40 shadow-gold-glow">
          <ShieldCheck className="w-8 h-8 text-resort-gold" />
        </div>

        <h2 className="font-display text-3xl font-bold tracking-[0.2em] text-white uppercase">
          SADGURU RESORT
        </h2>
        <p className="font-serif italic text-sm text-resort-cream/70 mt-1">
          Management & Administration Console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-resort-cream rounded-3xl p-8 sm:p-10 shadow-2xl border border-resort-gold/30">

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-gray-600 font-bold block mb-1">
                Admin ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Admin ID (e.g. rushi@8001)"
                  className="w-full text-xs font-semibold bg-white border border-resort-beigeDark rounded-xl pl-10 pr-3.5 py-3 text-resort-charcoal focus:outline-none focus:border-resort-gold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-gray-600 font-bold block mb-1">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs font-semibold bg-white border border-resort-beigeDark rounded-xl pl-10 pr-10 py-3 text-resort-charcoal focus:outline-none focus:border-resort-gold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient-bg text-resort-oliveDeep font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:shadow-gold-glow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
