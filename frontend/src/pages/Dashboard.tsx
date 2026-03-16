import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Download, Upload, Copy, Loader2 } from 'lucide-react';
import { userApi } from '../lib/api';

interface UserData {
  email: string;
  traffic_used_bytes: number;
  traffic_total_bytes: number;
  expire_at: string | null;
  balance: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 ** 2);
  return `${mb.toFixed(1)} MB`;
};

const Dashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userApi.me()
      .then(setUser)
      .catch(() => setError('无法加载用户数据，请刷新重试'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const usedPercent = user && user.traffic_total_bytes > 0
    ? Math.min(100, (user.traffic_used_bytes / user.traffic_total_bytes) * 100)
    : 0;

  const remaining = user ? user.traffic_total_bytes - user.traffic_used_bytes : 0;
  const expireDate = user?.expire_at ? new Date(user.expire_at).toLocaleDateString('zh-CN') : '未订阅';

  const stats = [
    { label: '剩余流量', value: formatBytes(remaining), icon: Activity, color: 'text-green-400' },
    { label: '已使用', value: formatBytes(user?.traffic_used_bytes || 0), icon: Upload, color: 'text-yellow-400' },
    { label: '总流量', value: formatBytes(user?.traffic_total_bytes || 0), icon: Download, color: 'text-blue-400' },
    { label: '到期时间', value: expireDate, icon: Clock, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Welcome, <span style={{ color: 'var(--primary)' }}>{user?.email?.split('@')[0]}</span>
        </h1>
        <p className="text-white/50 mt-1">Your subscription dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -3 }} className="glass-panel p-5">
            <stat.icon size={20} className={`${stat.color} mb-3`} />
            <p className="text-xs text-white/50 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Traffic Bar */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-white">流量使用情况</h3>
          <span className="text-sm text-white/50">{usedPercent.toFixed(1)}% 已用</span>
        </div>
        <div className="w-full rounded-full h-3 mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usedPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-3 rounded-full"
            style={{ background: usedPercent > 80 ? '#ef4444' : 'var(--primary)' }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>{formatBytes(user?.traffic_used_bytes || 0)} 已用</span>
          <span>{formatBytes(user?.traffic_total_bytes || 0)} 总量</span>
        </div>
      </div>

      {/* Quick Sub URL */}
      <div className="glass-panel p-6">
        <h3 className="font-semibold text-white mb-4">订阅链接</h3>
        <div className="flex items-center gap-3">
          <input
            readOnly
            value={`${window.location.origin}/api/v1/sub/${localStorage.getItem('access_token')}`}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-mono text-white/60"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/v1/sub/${localStorage.getItem('access_token')}`)}
            className="p-3 rounded-xl transition-all hover:bg-white/10"
          >
            <Copy size={18} className="text-white/50 hover:text-white" />
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>支持 Clash、Sing-Box、V2rayN 等所有客户端</p>
      </div>

      {/* Balance */}
      <div className="glass-panel p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50 mb-1">账户余额</p>
          <p className="text-2xl font-bold text-white">¥ {(user?.balance || 0).toFixed(2)}</p>
        </div>
        <button className="btn-primary px-6 py-2.5 text-sm">充值</button>
      </div>
    </div>
  );
};

export default Dashboard;
