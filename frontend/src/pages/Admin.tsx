import { motion } from 'framer-motion';
import { Users, CreditCard, Activity, Server, TrendingUp, AlertCircle } from 'lucide-react';

const AdminStatCard = ({ title, value, trend, icon: Icon, colorClass }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-panel p-6 border-t-2 border-t-white/10 relative overflow-hidden group"
    style={{ borderTopColor: colorClass }}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg bg-white/5`}>
        <Icon size={20} className={colorClass} />
      </div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded bg-white/5 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    
    <div>
        <p className="text-3xl font-bold text-white tracking-tight mb-1">{value}</p>
        <h3 className="text-sm text-white/50 font-medium">{title}</h3>
    </div>
  </motion.div>
);

const Admin = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="text-white/60 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            All edge nodes operating normally
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard 
          title="Total Active Users" 
          value="12,482" 
          trend={12.5}
          icon={Users} 
          colorClass="text-blue-400"
        />
        <AdminStatCard 
          title="Monthly Revenue" 
          value="$45,210" 
          trend={8.2}
          icon={CreditCard} 
          colorClass="text-green-400"
        />
        <AdminStatCard 
          title="Active Nodes" 
          value="34 / 35" 
          trend={-2.8}
          icon={Server} 
          colorClass="text-purple-400"
        />
        <AdminStatCard 
          title="Total Bandwidth" 
          value="452.8 TB" 
          trend={18.4}
          icon={Activity} 
          colorClass="text-pink-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 glass-panel p-6">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                 <button className="text-sm text-primary hover:text-primary-hover font-medium">View All</button>
             </div>
             
             {/* Mock Table */}
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-white/70">
                     <thead className="text-xs text-white/40 uppercase bg-white/5 border-b border-white/10">
                         <tr>
                             <th className="px-4 py-3 rounded-tl-lg">OrderID</th>
                             <th className="px-4 py-3">User</th>
                             <th className="px-4 py-3">Package</th>
                             <th className="px-4 py-3">Amount</th>
                             <th className="px-4 py-3 rounded-tr-lg">Status</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         <tr className="hover:bg-white/5 transition-colors">
                             <td className="px-4 py-3 font-mono">ORD_X92JKA</td>
                             <td className="px-4 py-3">alex@example.com</td>
                             <td className="px-4 py-3">Elite Tier (1 Yr)</td>
                             <td className="px-4 py-3 font-semibold text-green-400">$120.00</td>
                             <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">PAID</span></td>
                         </tr>
                         <tr className="hover:bg-white/5 transition-colors">
                             <td className="px-4 py-3 font-mono">ORD_B47PLS</td>
                             <td className="px-4 py-3">sarah@domain.io</td>
                             <td className="px-4 py-3">Pro Tier (1 Mo)</td>
                             <td className="px-4 py-3 font-semibold text-green-400">$10.00</td>
                             <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">PAID</span></td>
                         </tr>
                     </tbody>
                 </table>
             </div>
          </div>
          
          <div className="glass-panel p-6">
             <h3 className="text-lg font-bold text-white mb-6">System Alerts</h3>
             <div className="space-y-4">
                 <div className="flex items-start gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                     <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
                     <div>
                         <h4 className="text-sm font-semibold text-white mb-1">Tokyo Node #3 Down</h4>
                         <p className="text-xs text-white/60">Node stopped reporting heartbeat 5 mins ago. Reality implementation may be blocked.</p>
                     </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                     <TrendingUp className="text-yellow-400 shrink-0 mt-0.5" size={20} />
                     <div>
                         <h4 className="text-sm font-semibold text-white mb-1">High Bandwidth Usage</h4>
                         <p className="text-xs text-white/60">Global traffic spiked 45% above average in the last hour.</p>
                     </div>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Admin;
