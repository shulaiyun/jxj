import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, Loader2, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';
import { authApi } from '../lib/api';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.register(email, password, inviteCode || undefined);
      setSuccess(true);
      // NOTE: 使用 setTimeout 延迟跳转，让用户看到注册成功提示
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { detail?: string } } };
      const msg = apiError.response?.data?.detail || '注册失败，请稍后重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 注册成功后显示全屏成功提示，避免组件部分卸载导致黑屏
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)' }}>
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">注册成功！</h3>
        <p className="text-white/50 text-sm mb-1">账号已创建，正在跳转到登录页...</p>
        <Loader2 size={18} className="animate-spin text-white/30 mx-auto mt-4" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 text-center relative z-10">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Join NextGen</h2>
        <p className="text-white/60">Unlock an unparalleled proxy experience.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl text-sm text-red-400"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={16} className="shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-6 relative z-10">
        <div>
          <label className="input-label">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={18} className="text-white/40" />
            </div>
            <input type="email" className="input-field pl-11" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="input-label">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={18} className="text-white/40" />
            </div>
            <input type="password" className="input-field pl-11" placeholder="Create a strong password"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
        </div>

        <div>
          <label className="input-label flex items-center justify-between">
            <span>Invite Code</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded-md"
              style={{ color: 'var(--primary)', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
              Optional
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <KeyRound size={18} className="text-white/40" />
            </div>
            <input type="text" className="input-field pl-11 font-mono uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
              placeholder="e.g. NEXTGEN-VIP" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
          </div>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Enter an invite code to get bonus rewards!</p>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary mt-8 group">
          {loading
            ? <Loader2 size={20} className="animate-spin" />
            : <><span>Create Account</span> <UserPlus size={18} className="group-hover:scale-110 transition-transform" /></>
          }
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-white/60 relative z-10">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold transition-colors" style={{ color: 'var(--accent)' }}>Sign in instead</Link>
      </div>
    </>
  );
};

export default Register;
