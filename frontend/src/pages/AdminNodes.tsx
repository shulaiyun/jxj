import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Server, Edit2, Trash2, ShieldAlert, Cpu } from 'lucide-react';

const AdminNodes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [protocol, setProtocol] = useState('vless-reality'); // Defaulting to advanced protocol

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Node Management</h1>
          <p className="text-white/60 mt-1">Configure advanced protocols and routing mechanisms.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
        >
          <Plus size={18} />
          Deploy New Edge
        </button>
      </div>

      {/* Node List Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
                <thead className="text-xs text-white/40 uppercase bg-white/5 border-b border-white/10">
                    <tr>
                        <th className="px-6 py-4">Node Alias</th>
                        <th className="px-6 py-4">Protocol Stack</th>
                        <th className="px-6 py-4">Status / Multiplier</th>
                        <th className="px-6 py-4 text-right transform-none">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    <tr className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                    <Server size={18} />
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-base">🇯🇵 Tokyo - BGP Elite</p>
                                    <p className="text-xs text-white/40 font-mono">103.45.xx.xx</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-semibold w-max border border-purple-500/20">
                                    <ShieldAlert size={12} />
                                    VLESS-Reality
                                </span>
                                <span className="text-xs text-white/40">SNI: www.apple.com</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-white/80 font-medium text-xs">ONLINE</span>
                                </div>
                                <span className="text-xs text-white/50">Rate: 1.0x</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    
                    <tr className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-accent/20 text-accent">
                                    <Cpu size={18} />
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-base">🇺🇸 LA - CN2 GIA</p>
                                    <p className="text-xs text-white/40 font-mono">185.122.xx.xx</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold w-max border border-blue-500/20">
                                    <Zap size={12} />
                                    Hysteria2
                                </span>
                                <span className="text-xs text-white/40">UDP/QUIC Bruteforce</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-white/80 font-medium text-xs">ONLINE</span>
                                </div>
                                <span className="text-xs text-white/50">Rate: 2.0x</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      {/* Deep Dark Modal for Node Creation */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-panel w-full max-w-2xl bg-[#0a0a0a]/90 relative z-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* Visual Header Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-primary/30 filter blur-[50px] pointer-events-none rounded-full"></div>
                
                <div className="p-6 border-b border-white/10 relative">
                    <h2 className="text-xl font-bold text-white">Deploy Advanced Node</h2>
                    <p className="text-sm text-white/50 mt-1">Select protocol stack and configure reality masking parameters.</p>
                </div>

                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Node Alias</label>
                            <input type="text" className="input-field bg-black/40" placeholder="e.g. HK | BGP 01" />
                        </div>
                        <div>
                            <label className="input-label">Server Address (IP/Domain)</label>
                            <input type="text" className="input-field bg-black/40 font-mono text-sm" placeholder="1.1.1.1" />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Architecture Protocol</label>
                        <select 
                            className="input-field bg-black/40 appearance-none bg-no-repeat bg-[right_1rem_center]" 
                            style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23a1a1aa\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")'}}
                            value={protocol}
                            onChange={(e) => setProtocol(e.target.value)}
                        >
                            <option value="vless-reality">VLESS + XTLS-Reality (Anti-GFW DPI)</option>
                            <option value="hysteria2">Hysteria2 (UDP Bruteforce)</option>
                            <option value="tuic5">Tuic V5 (QUIC)</option>
                            <option value="trojan">Trojan (Legacy)</option>
                        </select>
                    </div>

                    {/* Conditional Fields: Reality config block */}
                    {protocol === 'vless-reality' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert size={16} className="text-primary" />
                                <h4 className="text-sm font-semibold text-primary">Reality Config Injection parameters</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-white/60 mb-1 block">Dest Override (SNI)</label>
                                    <input type="text" className="input-field py-2 text-sm bg-black/50" defaultValue="www.apple.com:443" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-white/60 mb-1 block">ServerNames (Comma separated)</label>
                                    <input type="text" className="input-field py-2 text-sm bg-black/50" defaultValue="www.apple.com,apple.com" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-medium text-white/60 mb-1 block">PublicKey / PrivateKey Set</label>
                                    <div className="flex gap-2">
                                        <input type="text" className="input-field py-2 text-sm bg-black/50 font-mono text-white/40" placeholder="Public Key..." />
                                        <button className="px-3 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white text-xs font-medium transition-colors whitespace-nowrap">
                                            Auto Gen
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-white/60 mb-1 block">ShortIds</label>
                                    <input type="text" className="input-field py-2 text-sm bg-black/50 font-mono" defaultValue="e07b8b2e" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Conditional Fields: Hysteria2 config block */}
                    {protocol === 'hysteria2' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Zap size={16} className="text-blue-400" />
                                <h4 className="text-sm font-semibold text-blue-400">Hysteria2 Tuning (UDP)</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-white/60 mb-1 block">Up Link (Mbps)</label>
                                    <input type="number" className="input-field py-2 text-sm bg-black/50" placeholder="Auto" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-white/60 mb-1 block">Down Link (Mbps)</label>
                                    <input type="number" className="input-field py-2 text-sm bg-black/50" placeholder="Auto" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-white/60 mb-1 block">Authentication Password</label>
                                    <input type="text" className="input-field py-2 text-sm bg-black/50 font-mono" placeholder="Generated per user natively" disabled />
                                    <p className="text-[10px] text-white/30 mt-1">Hysteria2 passwords are dynamically mapped to user UUIDs via API.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button className="btn-primary">
                        Persist Configuration
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNodes;

// Stub for Zap icon missing in standard import above
const Zap = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);
