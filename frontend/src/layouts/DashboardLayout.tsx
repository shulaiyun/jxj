import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Activity, Shield, LogOut, Menu, X, MessageSquareHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from '../components/AIAssistant';

const DashboardLayout = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Store & Plans', href: '/dashboard/store', icon: ShoppingCart },
    { name: 'My Nodes', href: '/dashboard/nodes', icon: Activity },
    { name: 'Support', href: '/dashboard/tickets', icon: MessageSquareHeart },
  ];

  const adminNavigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Node Management', href: '/admin/nodes', icon: Activity },
    { name: 'System Logs', href: '/admin/logs', icon: Shield },
  ];

  const navigation = isAdmin ? adminNavigation : userNavigation;

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Mobile Topbar */}
      <div className="md:hidden glass-panel m-4 p-4 flex justify-between items-center z-50 relative">
        <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white text-sm font-bold italic">N</span>
            </div>
            <span className="text-white text-lg font-bold">NextGen {isAdmin && 'Admin'}</span>
        </Link>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white/80 p-2 hover:bg-white/10 rounded-lg transition">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
            <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={`
                fixed md:static inset-y-0 left-0 z-40 w-64 m-4 mr-0 md:mr-4
                glass-panel flex flex-col py-6 px-4
                ${isSidebarOpen ? 'block' : 'hidden md:flex'}
            `}>
            {/* Desktop Logo */}
            <div className="hidden md:flex items-center gap-3 px-4 mb-10">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-white text-xl font-bold italic">N</span>
                </div>
                <div>
                    <span className="block text-white text-xl font-bold leading-tight">NextGen</span>
                    {isAdmin && <span className="block text-xs font-semibold text-accent uppercase tracking-wider">Admin Pro</span>}
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 space-y-2 relative z-10">
                {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                    <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium
                        ${isActive 
                            ? 'bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]' 
                            : 'text-white/60 hover:text-white hover:bg-white/5'}
                    `}
                    >
                    <item.icon size={20} className={isActive ? 'text-white' : 'text-white/50'} />
                    {item.name}
                    </Link>
                );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto pt-6 border-t border-white/10">
                <div className="px-4 py-3 flex items-center gap-3 rounded-xl cursor-pointer text-white/60 hover:text-white hover:bg-white/5 transition-all">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent"></div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">Administrator</p>
                    <p className="text-xs text-white/40 truncate">admin@nextgen.cc</p>
                </div>
                </div>
                <button className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all font-medium">
                <LogOut size={20} />
                Logout
                </button>
            </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full relative z-10">
          <Outlet />
      </main>
      
      {/* Global AI Assistant Floating Widget */}
      <AIAssistant />
    </div>
  );
};

export default DashboardLayout;

