import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Activity, Shield, LogOut, Menu, X, MessageSquareHeart, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from '../components/AIAssistant';
import { userApi } from '../lib/api';

const DashboardLayout = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('user@nextgen.cc');

  useEffect(() => {
    // Check if the current logged-in user is an admin
    userApi.me()
      .then(res => {
        setUserIsAdmin(res.is_admin);
        if (res.email) setUserEmail(res.email);
      })
      .catch(() => {});
  }, []);

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Store & Plans', href: '/dashboard/store', icon: ShoppingCart },
    { name: 'My Nodes', href: '/dashboard/nodes', icon: Activity },
    { name: 'Support', href: '/dashboard/tickets', icon: MessageSquareHeart },
  ];

  const adminNavigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Shield },
    { name: 'Plans', href: '/admin/plans', icon: ShoppingCart },
    { name: 'Nodes', href: '/admin/nodes', icon: Activity },
    { name: 'System Logs', href: '/admin/logs', icon: Shield },
  ];

  const navigation = isAdmin ? adminNavigation : userNavigation;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

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

            {/* Admin Switcher & Bottom Actions */}
            <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
                
                {/* Switcher Button for Admins */}
                {userIsAdmin && (
                    <Link 
                        to={isAdmin ? '/dashboard' : '/admin'}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-[0_0_15px_rgba(139,92,246,0.15)] bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary hover:to-accent transition-all duration-300"
                    >
                        <Settings size={18} />
                        {isAdmin ? 'Back to Dashboard' : 'Enter Admin Panel'}
                    </Link>
                )}

                <div className="px-4 py-3 flex items-center gap-3 rounded-xl cursor-default text-white/60 transition-all">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-primary to-accent text-white font-bold text-sm">
                        {userEmail[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{isAdmin ? 'Administrator' : 'User'}</p>
                        <p className="text-xs text-white/40 truncate">{userEmail}</p>
                    </div>
                </div>
                
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all font-medium">
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
