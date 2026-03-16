import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Star, Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { plansApi, ordersApi } from '../lib/api';

interface Plan {
  id: number;
  name: string;
  description: string | null;
  price_monthly: number;
  price_quarterly: number | null;
  price_yearly: number | null;
  traffic_gb: number;
  speed_mbps: number | null;
  max_devices: number;
}

const planIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('elite') || n.includes('vip')) return <Shield size={22} className="text-pink-400" />;
  if (n.includes('pro') || n.includes('plus')) return <Star size={22} style={{ color: 'var(--primary)' }} />;
  return <Zap size={22} className="text-blue-400" />;
};

const Store = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  useEffect(() => {
    plansApi.list()
      .then(setPlans)
      .catch(() => setError('无法加载套餐，请刷新重试'))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (planId: number) => {
    setPurchasing(planId);
    try {
      const result = await ordersApi.checkout(planId, period);
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
      } else {
        alert(`订单已创建！订单号: ${result.trade_no}\n暂未配置支付网关。`);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || '下单失败，请重试');
    } finally {
      setPurchasing(null);
    }
  };

  const getPrice = (plan: Plan) => {
    if (period === 'quarterly') return plan.price_quarterly ?? null;
    if (period === 'yearly') return plan.price_yearly ?? null;
    return plan.price_monthly;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-white/30" /></div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">Choose Your Plan</h1>
        <p className="text-white/50 max-w-xl mx-auto">All plans include Reality, Hysteria2, and AI assistant support.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Period Switcher */}
      <div className="flex justify-center">
        <div className="flex rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['monthly', 'quarterly', 'yearly'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={period === p ? { backgroundColor: 'var(--primary)', color: 'white' } : { color: 'rgba(255,255,255,0.5)' }}>
              {p === 'monthly' ? '月付' : p === 'quarterly' ? '季付' : '年付'}
            </button>
          ))}
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="glass-panel p-12 text-center text-white/40">
          <p>暂无可用套餐，请联系管理员</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = getPrice(plan);
            return (
              <motion.div key={plan.id} whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass-panel p-6 flex flex-col border"
                style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
                  {planIcon(plan.name)}
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                </div>
                <div className="mb-4">
                  {price !== null ? (
                    <><span className="text-4xl font-bold text-white">¥{price}</span><span className="text-white/50 text-sm">/{period === 'monthly' ? '月' : period === 'quarterly' ? '季' : '年'}</span></>
                  ) : (
                    <span className="text-white/40 text-sm">该周期不可用</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1 text-sm text-white/70">
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-400" />{plan.traffic_gb} GB 月流量</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-400" />{plan.max_devices} 台设备</li>
                  {plan.speed_mbps && <li className="flex items-center gap-2"><Check size={14} className="text-green-400" />{plan.speed_mbps} Mbps 限速</li>}
                  {plan.description && <li className="flex items-center gap-2"><Check size={14} className="text-green-400" />{plan.description}</li>}
                </ul>
                <button onClick={() => price !== null && handleBuy(plan.id)}
                  disabled={price === null || purchasing === plan.id}
                  className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 text-white"
                  style={{ backgroundColor: price !== null ? 'var(--primary)' : 'rgba(255,255,255,0.1)', opacity: price !== null ? 1 : 0.5 }}>
                  {purchasing === plan.id ? <Loader2 size={18} className="animate-spin" /> : <><span>立即订阅</span><ArrowRight size={16} /></>}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Store;
