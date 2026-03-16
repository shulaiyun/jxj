import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative">
      
      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 md:left-12">
        <Link to="/" className="flex items-center gap-3 decoration-transparent">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white text-xl font-bold italic">N</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">NextGen</span>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 md:p-10 relative overflow-hidden">
             {/* Decorative inner glow */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full filter blur-[50px] pointer-events-none"></div>
             
             <Outlet />
        </div>
        
        {/* Footer info under the auth box */}
        <div className="text-center mt-8 text-white/40 text-sm font-medium">
            &copy; 2026 NextGen Ecosystem. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
