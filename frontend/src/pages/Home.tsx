import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Shield, Cpu, CheckCircle2, 
  ArrowRight, Activity, Lock 
} from 'lucide-react';
import { plansApi } from '../lib/api';

interface Plan {
  id: number;
  name: string;
  monthly_price: number;
  quarterly_price: number | null;
  yearly_price: number | null;
  data_limit_gb: number;
  device_limit: number;
  speed_limit_mbps: number;
  is_active: boolean;
}

const Home = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    plansApi.list()
      .then(data => setPlans(data.filter((p: Plan) => p.is_active)))
      .catch(err => console.error("Failed to fetch plans", err))
      .finally(() => setLoadingPlans(false));
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-[40%] left-[80%] w-[30%] h-[30%] bg-pink-600/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mask-image-radial-gradient"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/20">
              N
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">NextGen<span className="text-white/50">Network</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#network" className="hover:text-white transition-colors">Network</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors hidden sm:block">Sign In</Link>
            <Link to="/register" className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors shadow-xl shadow-white/10">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-20">
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl flex flex-col items-center">
            
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-purple-300 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Enter the Next Generation of Proxies
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Unrestricted Access, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">Zero Compromise.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl leading-relaxed">
              Experience the internet without borders. Enterprise-grade encryption, AI-driven routing, and multi-protocol support tailored for professionals who demand the best.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-lg transition-all flex items-center justify-center">
                View Pricing
              </a>
            </motion.div>

          </motion.div>
        </section>

        {/* Stats Strip */}
        <section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            <div className="flex flex-col items-center text-center px-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-sm text-white/50 uppercase tracking-wider font-medium">Uptime SLA</div>
            </div>
            <div className="flex flex-col items-center text-center px-4">
               <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-sm text-white/50 uppercase tracking-wider font-medium">Global Regions</div>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">&lt; 30ms</div>
              <div className="text-sm text-white/50 uppercase tracking-wider font-medium">Avg Latency</div>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">Multi</div>
              <div className="text-sm text-white/50 uppercase tracking-wider font-medium">Protocol Support</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Engineered for Performance</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">We don't just provide IP addresses. We deliver a complete network infrastructure layer with state-of-the-art tunneling technologies.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.08] transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Zap size={120} />
              </div>
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-6 border border-purple-500/30">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Optimized Routing</h3>
              <p className="text-white/60 leading-relaxed">Our proprietary controller dynamically routes your traffic through the least congested backbone automatically.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.08] transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Lock size={120} />
              </div>
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/30">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Bank-Grade Privacy</h3>
              <p className="text-white/60 leading-relaxed">Strict no-logs policy backed by decentralized RAM-only nodes. What you do online is completely invisible to us.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.08] transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Cpu size={120} />
              </div>
              <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 border border-cyan-500/30">
                <Activity size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Next-Gen Protocols</h3>
              <p className="text-white/60 leading-relaxed">Native support for VLESS-Reality, Hysteria2, Trojan and more. Seamlessly adapt to any network environment.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 bg-white/[0.02] border-y border-white/5 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto">Choose the tier that fits your needs. Cancel anytime. No hidden fees.</p>
            </div>

            {loadingPlans ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.slice(0, 3).map((plan, index) => (
                  <div key={plan.id} className={`relative rounded-3xl p-8 flex flex-col ${index === 1 ? 'bg-gradient-to-b from-purple-900/40 to-black border border-purple-500/50 shadow-2xl shadow-purple-500/10' : 'bg-black/40 border border-white/10'}`}>
                    {index === 1 && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-xs font-bold tracking-wide">
                        MOST POPULAR
                      </div>
                    )}
                    
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-extrabold">¥{plan.monthly_price}</span>
                      <span className="text-white/50 font-medium">/mo</span>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-purple-400" />
                        <span className="text-white/80">{plan.data_limit_gb} GB High-Speed Data</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-purple-400" />
                        <span className="text-white/80">Up to {plan.device_limit} Devices</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-purple-400" />
                        <span className="text-white/80">{plan.speed_limit_mbps === 0 ? 'Uncapped Speed' : `${plan.speed_limit_mbps} Mbps Max Speed`}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-purple-400" />
                        <span className="text-white/80">Premium Node Routing</span>
                      </div>
                      <div className="flex items-center gap-3 opacity-50">
                        <CheckCircle2 size={18} className="text-white/50" />
                        <span className="text-white/80">Priority Support</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('/register')}
                      className={`w-full py-3.5 rounded-xl font-semibold transition-all ${index === 1 ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      Get {plan.name}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 relative max-w-5xl mx-auto text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-[3rem] blur-3xl -z-10"></div>
          <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-12 md:p-20 backdrop-blur-xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Experience True Freedom?</h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">Join thousands of users who have already upgraded their digital life. Setup takes less than 3 minutes.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="px-10 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors shadow-xl shadow-white/10">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm">
                N
              </div>
              <span className="font-bold text-lg tracking-tight">NextGen</span>
            </div>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed">
              We provide enterprise-grade network infrastructure and proxy services for individuals and businesses worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Download App</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Network Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-sm text-white/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} NextGen Network. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/admin" className="hover:text-white transition-colors">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
