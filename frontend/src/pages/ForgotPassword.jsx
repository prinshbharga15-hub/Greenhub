import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Key, ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';
import { ToastContext } from '../context/ToastContext';

const ForgotPassword = () => {
  const { showToast } = React.useContext(ToastContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email: email.trim() });
      showToast('Mock password reset code generated!', 'success');
      setResetToken(res.data.resetToken);
    } catch (err) {
      showToast(err.response?.data?.error || 'Email not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-1.5 text-3xl font-extrabold text-emerald-700 tracking-tight">
            <Leaf className="w-9 h-9 text-emerald-600 fill-emerald-100" />
            <span>Green<span className="text-emerald-500 font-medium">Hub</span></span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800 m-0">Recover Password</h2>
          <p className="text-xs text-slate-400 font-semibold">Enter email to generate a mock password reset token</p>
        </div>

        {/* Forgot password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
          <div>
            <label className="block uppercase text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 mt-4"
          >
            <Send size={16} />
            {loading ? 'Generating Code...' : 'Get Reset Token'}
          </button>
        </form>

        {/* Display reset token directly for easy copy paste testing */}
        {resetToken && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-amber-800 block">Copy your test token:</span>
            <code className="text-xs font-bold text-amber-900 bg-amber-100/60 block p-2 rounded-lg text-center break-all select-all">
              {resetToken}
            </code>
            <Link
              to={`/reset-password?token=${resetToken}`}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm mt-2"
            >
              <Key size={14} /> Go Reset Password
            </Link>
          </div>
        )}

        <hr className="border-slate-100" />

        <div className="text-center text-xs text-slate-500 font-medium">
          <Link to="/login" className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5">
            <ArrowLeft size={12} /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
