import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquareHeart, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { ticketsApi } from '../lib/api';

interface TicketMessage {
  id: number;
  content: string;
  is_from_user: boolean;
}

interface Ticket {
  id: number;
  subject: string;
  status: string;
  created_at: string;
  messages: TicketMessage[];
}

const Tickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const fetchTickets = () => {
    ticketsApi.list().then(setTickets).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ticketsApi.create(subject, message);
      setSubject('');
      setMessage('');
      setShowNew(false);
      fetchTickets();
    } catch {
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Support Tickets</h1>
          <p className="text-white/50 mt-1">Our AI handles most tickets instantly. Complex issues go to our team.</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 text-white active:scale-95 transition-all"
          style={{ backgroundColor: 'var(--primary)' }}>
          <Plus size={16} />Open New Ticket
        </button>
      </div>

      {showNew && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 border" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
          <h3 className="font-bold text-white mb-4">New Support Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Subject</label>
              <input type="text" className="input-field" placeholder="Briefly describe your issue..."
                value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea rows={4} className="input-field resize-none" placeholder="Provide more details..."
                value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowNew(false)} className="btn-secondary px-6 py-2.5 text-sm">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary text-sm px-6">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="glass-panel overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="font-semibold text-white">My Tickets</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center"><Loader2 size={24} className="animate-spin text-white/30 mx-auto" /></div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            <MessageSquareHeart size={40} className="mx-auto mb-3 opacity-30" />
            <p>No tickets yet. Click "Open New Ticket" if you need help.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {ticket.status === 'resolved'
                      ? <CheckCircle size={18} className="text-green-400" />
                      : <Clock size={18} className="text-yellow-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{ticket.subject}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      #{ticket.id} · {new Date(ticket.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {ticket.status === 'resolved' ? 'Resolved' : 'Open'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;
