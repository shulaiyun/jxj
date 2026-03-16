import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../lib/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || '登录失败，请检查邮箱和密码';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10 text-center relative z-10">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h2>
        <p className="text-white/60">Enter your credentials to access the panel.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6 relative z-10">
        <div>
          <label className="input-label">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={18} className="text-white/40" />
            </div>
            <input
              type="email"
              className="input-field pl-11"
              placeholder="admin@nextgen.cc"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Password</label>
            <a href="#" className="text-xs font-medium transition-colors" style={{ color: 'var(--primary)' }}>Forgot password?</a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={18} className="text-white/40" />
            </div>
            <input
              type="password"
              className="input-field pl-11"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary mt-8 group">
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-white/60 relative z-10">
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--primary)' }} className="font-semibold transition-colors">
          Create one now
        </Link>
      </div>
    </>
  );
};

export default Login;
