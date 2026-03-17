import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Store from './pages/Store';
import MyNodes from './pages/MyNodes';
import Tickets from './pages/Tickets';
import Admin from './pages/Admin';
import AdminNodes from './pages/AdminNodes';
import AdminLogs from './pages/AdminLogs';
import AdminUsers from './pages/AdminUsers';
import AdminPlans from './pages/AdminPlans';

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
        <Route path="/" element={<Home />} />

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
          <Route path="users" element={<AdminUsers />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="nodes" element={<AdminNodes />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
