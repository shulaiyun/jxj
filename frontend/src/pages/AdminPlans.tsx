import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Edit2, Trash2, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { adminApi, plansApi } from '../lib/api';

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

const AdminPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_monthly: 0,
    price_quarterly: 0,
    price_yearly: 0,
    traffic_gb: 100,
    speed_mbps: 0,
    max_devices: 3,
  });

  const fetchPlans = () => {
    plansApi.list()
      .then(setPlans)
      .catch((err) => setError(err.response?.data?.detail || '无法加载套餐'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '', description: '', price_monthly: 10, price_quarterly: 28, price_yearly: 100,
      traffic_gb: 100, speed_mbps: 0, max_devices: 3,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price_monthly: plan.price_monthly,
      price_quarterly: plan.price_quarterly || 0,
      price_yearly: plan.price_yearly || 0,
      traffic_gb: plan.traffic_gb,
      speed_mbps: plan.speed_mbps || 0,
      max_devices: plan.max_devices,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Clean up empty values
    const payload = {
      ...formData,
      speed_mbps: formData.speed_mbps || null,
      price_quarterly: formData.price_quarterly || null,
      price_yearly: formData.price_yearly || null,
      description: formData.description || null,
    };

    try {
      if (editingPlan) {
        await adminApi.updatePlan(editingPlan.id, payload);
      } else {
        await adminApi.createPlan(payload);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.detail || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个套餐吗？这不会影响已经购买该套餐的用户，但将无法再购买。')) return;
    try {
      await adminApi.deletePlan(id);
      fetchPlans();
    } catch (err: any) {
      alert('删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Plans Management</h1>
          <p className="text-white/50 mt-1">Configure subscription tiers and pricing.</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
          <Plus size={16} /> Create Plan
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-red-400 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center"><Loader2 size={24} className="animate-spin text-white/30 mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div key={plan.id} className="glass-panel p-6 border relative" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => openEditModal(plan)} className="text-white/40 hover:text-blue-400 transition-colors p-1"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(plan.id)} className="text-white/40 hover:text-red-400 transition-colors p-1"><Trash2 size={16} /></button>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-white/50 mb-4 h-10">{plan.description || 'No description'}</p>
              
              <div className="mb-4 p-3 rounded-lg bg-white/5 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-white/60">Monthly</span><span className="font-mono text-white">¥{plan.price_monthly}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-white/60">Quarterly</span><span className="font-mono text-white">{plan.price_quarterly ? `¥${plan.price_quarterly}` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Yearly</span><span className="font-mono text-white">{plan.price_yearly ? `¥${plan.price_yearly}` : '-'}</span>
                </div>
              </div>

              <div className="flex gap-4 text-xs text-white/50">
                <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400"/> {plan.traffic_gb} GB</div>
                <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400"/> {plan.max_devices} Dev</div>
                <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400"/> {plan.speed_mbps || 'Unl'} Mbps</div>
              </div>
            </motion.div>
          ))}
          {plans.length === 0 && (
             <div className="col-span-1 md:col-span-2 lg:col-span-3 glass-panel p-12 text-center text-white/40">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <p>No plans created yet.</p>
             </div>
          )}
        </div>
      )}

      {/* Simplified Modal logic for brevity, uses overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel w-full max-w-xl p-6 border" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
            <h2 className="text-xl font-bold text-white mb-6">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="input-label">Plan Name</label>
                  <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="col-span-2">
                  <label className="input-label">Description (Optional)</label>
                  <input type="text" className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Monthly Price (¥)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.price_monthly} onChange={e => setFormData({...formData, price_monthly: parseFloat(e.target.value)})} required />
                </div>
                <div>
                  <label className="input-label">Quarterly Price (¥)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.price_quarterly} onChange={e => setFormData({...formData, price_quarterly: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="input-label">Yearly Price (¥)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.price_yearly} onChange={e => setFormData({...formData, price_yearly: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="input-label">Traffic Volume (GB/Month)</label>
                  <input type="number" className="input-field" value={formData.traffic_gb} onChange={e => setFormData({...formData, traffic_gb: parseInt(e.target.value)})} required />
                </div>
                <div>
                  <label className="input-label">Speed Limit (Mbps)</label>
                  <input type="number" className="input-field" value={formData.speed_mbps} onChange={e => setFormData({...formData, speed_mbps: parseInt(e.target.value)})} placeholder="0 for unlimited" />
                </div>
                <div>
                  <label className="input-label">Max Devices</label>
                  <input type="number" className="input-field" value={formData.max_devices} onChange={e => setFormData({...formData, max_devices: parseInt(e.target.value)})} required />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg text-white/70 hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary px-6 py-2">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Save Plan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
