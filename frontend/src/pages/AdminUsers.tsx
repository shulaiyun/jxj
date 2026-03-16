import { useEffect, useState } from 'react';
import { Users, Search, Ban, CheckCircle, Loader2, AlertCircle, Edit2, Wallet } from 'lucide-react';
import { adminApi } from '../lib/api';

interface AdminUser {
  id: number;
  email: string;
  traffic_used_bytes: number;
  traffic_total_bytes: number;
  expire_at: string | null;
  balance: number;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 ** 2);
  return `${mb.toFixed(1)} MB`;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    adminApi.listUsers()
      .then(setUsers)
      .catch((err) => setError(err.response?.data?.detail || '无法加载用户列表'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: AdminUser) => {
    if (!confirm(`确定要${user.is_active ? '封禁' : '解封'}用户 ${user.email} 吗？`)) return;
    setActionLoading(user.id);
    try {
      await adminApi.updateUser(user.id, { is_active: !user.is_active });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || '操作失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddBalance = async (user: AdminUser) => {
    const amountStr = prompt(`为用户 ${user.email} 充值余额（当前: ¥${user.balance}）:\n请输入充值金额（负数为扣除）:`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return alert('请输入有效的数字');
    
    setActionLoading(user.id);
    try {
      await adminApi.updateUser(user.id, { balance: user.balance + amount });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || '操作失败');
    } finally {
      setActionLoading(null);
    }
  };

  const setTraffic = async (user: AdminUser) => {
      const gbStr = prompt(`设置用户 ${user.email} 的总流量(GB):\n当前: ${formatBytes(user.traffic_total_bytes)}`);
      if (!gbStr) return;
      const gb = parseFloat(gbStr);
      if (isNaN(gb) || gb < 0) return alert('请输入有效的数字');

      setActionLoading(user.id);
      try {
        await adminApi.updateUser(user.id, { traffic_total_bytes: Math.floor(gb * 1024 * 1024 * 1024) });
        fetchUsers();
      } catch (err: any) {
        alert('操作失败');
      } finally {
        setActionLoading(null);
      }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.id.toString() === search);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Users Management</h1>
          <p className="text-white/50 mt-1">Total {users.length} registered users.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-red-400 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="Search by ID or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><Loader2 size={24} className="animate-spin text-white/30 mx-auto" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="text-xs text-white/40 uppercase bg-white/5">
                <tr>
                  <th className="px-6 py-4">ID / Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Traffic (Used / Total)</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.email}</div>
                      <div className="text-xs text-white/40 mt-1">ID: {user.id} · {user.is_admin ? <span className="text-primary">Admin</span> : 'User'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12} /> Active</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium flex items-center gap-1 w-max"><Ban size={12} /> Banned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      ¥{user.balance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${user.traffic_total_bytes > 0 ? Math.min(100, (user.traffic_used_bytes / user.traffic_total_bytes) * 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-xs">{formatBytes(user.traffic_used_bytes)} / {formatBytes(user.traffic_total_bytes)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleAddBalance(user)} 
                          disabled={actionLoading === user.id}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-green-400 transition-colors"
                          title="Add Balance"
                        >
                          <Wallet size={16} />
                        </button>
                        <button 
                          onClick={() => setTraffic(user)} 
                          disabled={actionLoading === user.id}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-blue-400 transition-colors"
                          title="Set Traffic"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user)} 
                          disabled={actionLoading === user.id || user.is_admin}
                          className={`p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ${user.is_active ? 'text-white/60 hover:text-red-400' : 'text-red-400 hover:text-green-400'}`}
                          title={user.is_active ? "Ban User" : "Unban User"}
                        >
                          {actionLoading === user.id ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                      <Users size={32} className="mx-auto mb-3 opacity-30" />
                      <p>No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
