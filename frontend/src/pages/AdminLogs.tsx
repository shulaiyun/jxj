import { motion } from 'framer-motion';
import { AlertTriangle, Info, ServerCrash } from 'lucide-react';

const logs = [
  { level: 'ERROR', time: '01:31:05', service: 'api', message: 'Failed to connect to Redis: Connection refused at 127.0.0.1:6379' },
  { level: 'WARN',  time: '01:28:42', service: 'web', message: 'High memory usage detected: 87% heap utilization on node-worker-3' },
  { level: 'INFO',  time: '01:15:00', service: 'api', message: 'User user_abc123 renewed subscription plan: Pro (30 days)' },
  { level: 'INFO',  time: '01:10:21', service: 'api', message: 'EPay webhook received: order ORD_X92JKA paid, amount=$120.00' },
  { level: 'WARN',  time: '00:55:09', service: 'db',  message: 'Slow query detected (>2s): SELECT * FROM v2_users WHERE invited_by=...' },
  { level: 'INFO',  time: '00:30:00', service: 'api', message: 'New user registered: user@example.com via referral link REF_ABC' },
  { level: 'ERROR', time: '00:12:45', service: 'api', message: 'Subscription delivery failed for user_xyz: No active node returned from pool' },
];

const levelStyle: Record<string, { icon: any; bg: string; text: string }> = {
  ERROR: { icon: ServerCrash, bg: 'bg-red-500/10', text: 'text-red-400' },
  WARN:  { icon: AlertTriangle, bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  INFO:  { icon: Info, bg: 'bg-blue-500/10', text: 'text-blue-400' },
};

const AdminLogs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">System Logs</h1>
        <p className="text-white/50 mt-1">Live backend event stream for debugging and monitoring.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-semibold text-white">Recent Events</h3>
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </span>
        </div>

        <div className="divide-y divide-white/5 font-mono text-sm">
          {logs.map((log, i) => {
            const { icon: Icon, bg, text } = levelStyle[log.level];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className={`p-1.5 rounded-md shrink-0 ${bg}`}>
                  <Icon size={14} className={text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-bold uppercase ${text}`}>{log.level}</span>
                    <span className="text-xs text-white/30">{log.time}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>{log.service}</span>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed break-all">{log.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
