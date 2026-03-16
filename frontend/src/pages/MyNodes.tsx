import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Copy, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { nodesApi } from '../lib/api';

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

const getLatencyColor = (ms: number) => {
  if (ms < 80) return 'text-green-400';
  if (ms < 150) return 'text-yellow-400';
  return 'text-red-400';
};

const MyNodes = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const subUrl = `${window.location.protocol}//${window.location.hostname}:8000/api/v1/sub/${localStorage.getItem('access_token')}`;

  useEffect(() => {
    nodesApi.list()
      .then(setNodes)
      .catch((err) => {
        if (err.response?.status === 400 || err.response?.status === 404) {
          setError('您当前没有有效订阅，请先购买套餐');
        } else {
          setError('加载节点失败，请刷新重试');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const copySubUrl = () => {
    navigator.clipboard.writeText(subUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-white/30" /></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">My Nodes</h1>
          <p className="text-white/50 mt-1">Tap a node to copy its link for your client app.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 text-white"
          style={{ backgroundColor: 'var(--primary)' }}>
          <ExternalLink size={16} />One-Click Import
        </button>
      </div>

      {/* Subscription URL */}
      <div className="glass-panel p-5">
        <p className="text-xs text-white/50 uppercase font-semibold tracking-widest mb-3">Universal Subscription URL</p>
        <div className="flex items-center gap-3">
          <input readOnly value={subUrl}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-mono text-white/60"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button onClick={copySubUrl} className="p-3 rounded-xl transition-all hover:bg-white/10" title="Copy">
            <Copy size={18} className={copied ? 'text-green-400' : 'text-white/50'} />
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Compatible with Clash, Sing-Box, V2rayN, NekoRay and more.</p>
      </div>

      {error && (
        <div className="glass-panel p-5 flex items-center gap-3 text-sm" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <div>
            <p className="text-white/70 font-medium">{error}</p>
            {error.includes('订阅') && (
              <a href="/dashboard/store" className="text-xs mt-1 block" style={{ color: 'var(--primary)' }}>前往商店购买套餐 →</a>
            )}
          </div>
        </div>
      )}

      {/* Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nodes.map((node) => (
          <motion.div key={node.id} whileHover={{ y: -3 }}
            className="glass-panel p-5 cursor-pointer border transition-colors hover:border-white/20"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {node.flag_emoji || '🌐'}
                </div>
                <div>
                  <p className="font-semibold text-white">{node.name}</p>
                  <p className="text-xs text-white/50 uppercase">{node.protocol}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-white/50 uppercase">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-white/30" />
                <span className="text-xs text-white/40">{node.host}:{node.port}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">倍率: {node.traffic_multiplier}x</span>
                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <Copy size={14} className="text-white/50" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {!loading && nodes.length === 0 && !error && (
          <div className="col-span-2 glass-panel p-12 text-center text-white/40">
            <Globe size={40} className="mx-auto mb-3 opacity-30" />
            <p>暂无可用节点，管理员尚未添加节点</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNodes;
