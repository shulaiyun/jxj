import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Store from './pages/Store';
import MyNodes from './pages/MyNodes';
import Tickets from './pages/Tickets';
import Admin from './pages/Admin';
import AdminNodes from './pages/AdminNodes';
import AdminLogs from './pages/AdminLogs';

// Landing page placeholder
const Landing = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-2xl text-3xl" style={{ backgroundColor: 'var(--primary)' }}>N</div>
    <h1 className="text-5xl font-bold text-white mb-4">NextGen Ecosystem</h1>
    <p className="text-white/50 text-lg max-w-md mb-8">The next-generation, AI-powered proxy panel built for speed, security, and scale.</p>
    <div className="flex gap-4">
      <a href="/login" className="btn-primary px-8 py-3 rounded-xl font-semibold">Sign In</a>
      <a href="/register" className="btn-secondary px-8 py-3 rounded-xl font-semibold">Get Started</a>
    </div>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center">
    <h1 className="text-8xl font-bold text-white/10 mb-4">404</h1>
    <p className="text-white/60 text-xl font-medium">页面未找到</p>
    <a href="/" className="mt-6 text-sm underline" style={{ color: 'var(--primary)' }}>回到首页</a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* Global Animated Background Elements */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
        <div className="bg-blob-3"></div>
      </div>

      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* User dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="store" element={<Store />} />
          <Route path="nodes" element={<MyNodes />} />
          <Route path="tickets" element={<Tickets />} />
        </Route>

        {/* Admin dashboard routes */}
        <Route path="/admin" element={<DashboardLayout isAdmin={true} />}>
          <Route index element={<Admin />} />
          <Route path="nodes" element={<AdminNodes />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
