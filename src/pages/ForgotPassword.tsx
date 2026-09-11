import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h3 className="text-xl font-bold text-slate-100">Forgot Password</h3>
        <p className="text-xs text-slate-400 mt-1">Enter your email and we'll send a password recovery link</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Reset Link Sent!</p>
            <p className="text-[11px] text-emerald-555 mt-0.5">Please check your email inbox to update your password credentials.</p>
          </div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full pl-9 pr-4 py-2.5 bg-[#071C17] border border-[#143D32] focus:border-emerald-500 focus:ring-1 focus:ring-teal-500/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Sending link...' : 'Send Recovery Link'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-slate-400 border-t border-[#143D32] pt-4">
        Remembered password?{' '}
        <Link to="/login" className="text-teal-400 hover:text-emerald-400 font-semibold transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
};
