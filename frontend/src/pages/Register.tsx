import { useState } from 'react';
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.register(email, password, inviteCode || undefined);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.detail || '注册失败，请稍后重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
      {success && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl text-sm text-green-400"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <CheckCircle size={16} className="shrink-0" />注册成功！正在跳转到登录页...
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
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="input-label flex items-center justify-between">
            <span>Invite Code</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded-md"
              style={{ color: 'var(--primary)', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>Optional</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <KeyRound size={18} className="text-white/40" />
            </div>
            <input type="text" className="input-field pl-11 font-mono uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
              placeholder="e.g. NEXTGEN-VIP" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
          </div>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Enter an invite code to get free time rewards!</p>
        </div>

        <button type="submit" disabled={loading || success} className="w-full btn-primary mt-8 group">
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>Create Account <UserPlus size={18} className="group-hover:scale-110 transition-transform" /></>
          )}
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
