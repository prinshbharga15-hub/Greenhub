import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Lock, Key, ArrowLeft, Save } from 'lucide-react';
import api from '../services/api';
import { ToastContext } from '../context/ToastContext';

const ResetPassword = () => {
  const { showToast } = React.useContext(ToastContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token') || '';

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [tokenParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim() || !newPassword) {
      showToast('Token and new password are required.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        token: token.trim(),
        newPassword
      });
      showToast('Password reset successfully! Please login with your new password.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.error || 'Reset failed. Token might be invalid or expired.', 'error');
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
          <h2 className="text-xl font-bold text-slate-800 m-0">Reset Password</h2>
          <p className="text-xs text-slate-400 font-semibold">Enter your reset code token and set a new password</p>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
          <div>
            <label className="block uppercase text-slate-400 mb-1.5">Reset Token Code</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter reset token"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block uppercase text-slate-400 mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
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
            <Save size={16} />
            {loading ? 'Saving Password...' : 'Save New Password'}
          </button>
        </form>

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

export default ResetPassword;
