import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Server, Edit2,Trash2, ShieldAlert, Cpu, CheckCircle, Ban, Loader2, AlertCircle } from 'lucide-react';
import { adminApi, nodesApi } from '../lib/api';

interface Node {
  id: number;
  name: string;
  host: string;
  port: number;
  protocol: string;
  country: string | null;
  flag_emoji: string | null;
  traffic_multiplier: number;
  is_active: boolean;
}

const AdminNodes = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 443,
    protocol: 'vless',
    traffic_multiplier: 1.0,
    is_active: true
  });

  const fetchNodes = () => {
    // Admin nodes list includes inactive nodes
    adminApi.listNodes()
      .then(setNodes)
      .catch((err) => setError(err.response?.data?.detail || '无法加载节点列表'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const openCreateModal = () => {
    setEditingNode(null);
    setFormData({
      name: '', host: '', port: 443, protocol: 'vless', traffic_multiplier: 1.0, is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (node: Node) => {
    setEditingNode(node);
    setFormData({
      name: node.name, host: node.host, port: node.port, protocol: node.protocol, 
      traffic_multiplier: node.traffic_multiplier, is_active: node.is_active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingNode) {
        await adminApi.updateNode(editingNode.id, formData);
      } else {
        await adminApi.createNode(formData);
      }
      setIsModalOpen(false);
      fetchNodes();
    } catch (err: any) {
      alert(err.response?.data?.detail || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (node: Node) => {
    try {
        await adminApi.updateNode(node.id, { is_active: !node.is_active });
        fetchNodes();
    } catch (e: any) {
        alert('状态更新失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此节点吗？该操作不可逆。')) return;
    try {
      // NOTE: Here we actually rely on API delete to deactivate or remove
      await adminApi.deleteNode(id);
      fetchNodes();
    } catch (err: any) {
      alert('删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Node Management</h1>
          <p className="text-white/60 mt-1">Configure advanced protocols and routing mechanisms.</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus size={18} /> Deploy New Edge
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-red-400 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Node List Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
             <div className="p-12 text-center"><Loader2 size={24} className="animate-spin text-white/30 mx-auto" /></div>
        ) : (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
                <thead className="text-xs text-white/40 uppercase bg-white/5 border-b border-white/10">
                    <tr>
                        <th className="px-6 py-4">Node Alias</th>
                        <th className="px-6 py-4">Protocol & Port</th>
                        <th className="px-6 py-4">Status / Multiplier</th>
                        <th className="px-6 py-4 text-right transform-none">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {nodes.map(node => (
                    <tr key={node.id} className={`hover:bg-white/5 transition-colors ${!node.is_active ? 'opacity-50' : ''}`}>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${node.protocol === 'vless' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {node.protocol === 'vless' ? <ShieldAlert size={18} /> : <Server size={18} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-base">[{node.id}] {node.name}</p>
                                    <p className="text-xs text-white/40 font-mono">{node.host}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold w-max border
                                    ${node.protocol === 'vless' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}
                                `}>
                                    <span className="uppercase">{node.protocol}</span>
                                </span>
                                <span className="text-xs text-white/40">Port: {node.port}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    {node.is_active ? (
                                        <><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-green-400 font-medium text-xs">ONLINE</span></>
                                    ) : (
                                        <><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-red-400 font-medium text-xs">OFFLINE</span></>
                                    )}
                                </div>
                                <span className="text-xs text-white/50">Rate: {node.traffic_multiplier.toFixed(1)}x</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleToggleStatus(node)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title={node.is_active ? "Deactivate" : "Activate"}>
                                    {node.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                                </button>
                                <button onClick={() => openEditModal(node)} className="p-2 text-white/40 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(node.id)} className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))}
                    {nodes.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-white/40">
                                <Server size={32} className="mx-auto mb-3 opacity-30" />
                                <p>No nodes deployed yet</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        )}
      </div>

      {/* Deep Dark Modal for Node Creation */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-panel w-full max-w-2xl bg-[#0a0a0a]/90 relative z-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* Visual Header Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-primary/30 filter blur-[50px] pointer-events-none rounded-full"></div>
                
                <div className="p-6 border-b border-white/10 relative">
                    <h2 className="text-xl font-bold text-white">{editingNode ? 'Edit Node' : 'Deploy Advanced Node'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Node Alias</label>
                            <input type="text" className="input-field bg-black/40" placeholder="e.g. HK | BGP 01" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div>
                            <label className="input-label">Server Address (IP/Domain)</label>
                            <input type="text" className="input-field bg-black/40 font-mono text-sm" placeholder="1.1.1.1" value={formData.host} onChange={e => setFormData({...formData, host: e.target.value})} required />
                        </div>
                        <div>
                            <label className="input-label">Port</label>
                            <input type="number" className="input-field bg-black/40 text-sm" value={formData.port} onChange={e => setFormData({...formData, port: parseInt(e.target.value)})} required />
                        </div>
                        <div>
                            <label className="input-label">Traffic Multiplier</label>
                            <input type="number" step="0.1" className="input-field bg-black/40 text-sm" value={formData.traffic_multiplier} onChange={e => setFormData({...formData, traffic_multiplier: parseFloat(e.target.value)})} required />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Architecture Protocol</label>
                        <select 
                            className="input-field bg-black/40 appearance-none bg-no-repeat bg-[right_1rem_center]" 
                            style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23a1a1aa\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")'}}
                            value={formData.protocol}
                            onChange={(e) => setFormData({...formData, protocol: e.target.value})}
                        >
                            <option value="vless">VLESS</option>
                            <option value="hysteria2">Hysteria2</option>
                            <option value="trojan">Trojan</option>
                        </select>
                    </div>

                    <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20 -mx-6 -mb-6 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary">
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Persist Configuration'}
                        </button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNodes;
