import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const rawRedirect = searchParams.get('redirect') || '';
  const redirect = (rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.includes('://')) ? rawRedirect : '';

  useEffect(() => {
    if (user) {
      const target = redirect || (user.role === 'admin' ? '/AdminDeshbord' : '/dashboard');
      navigate(target);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Please fill in all credentials.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      showToast('Logged in successfully!', 'success');
      const target = redirect || (loggedInUser.role === 'admin' ? '/AdminDeshbord' : '/dashboard');
      navigate(target);
    } catch (err) {
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
        
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-1.5 text-3xl font-extrabold text-emerald-700 tracking-tight">
            <Leaf className="w-9 h-9 text-emerald-600 fill-emerald-100" />
            <span>Green<span className="text-emerald-500 font-medium">Hub</span></span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800 m-0">Welcome Back!</h2>
          <p className="text-xs text-slate-400 font-semibold">Sign in to manage your orders and fresh grocery basket</p>
        </div>

        {/* Login Form */}
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

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block uppercase text-slate-400">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-emerald-700 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
            <LogIn size={18} />
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <hr className="border-slate-100" />

        {/* Footer actions */}
        <div className="text-center text-xs text-slate-500 font-medium">
          New to GreenHub?{' '}
          <Link to="/register" className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5">
            Create an Account <ArrowRight size={12} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
