import axios from 'axios';

// NOTE: 生产环境通过 VITE_API_URL 环境变量注入，本地开发默认指向后端容器端口
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// 请求拦截器：自动附加 Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：401 自动跳转登录页
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * 用户登录，返回 JWT access_token
   * NOTE: OAuth2 密码流必须使用 x-www-form-urlencoded 格式
   */
  login: async (email: string, password: string) => {
    const form = new URLSearchParams({ username: email, password });
    const res = await api.post('/auth/login/access-token', form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    localStorage.setItem('access_token', res.data.access_token);
    return res.data;
  },

  register: async (email: string, password: string, invite_code?: string) => {
    const res = await api.post('/auth/register', { email, password, invite_code });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const userApi = {
  me: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
};

// ── Plans ─────────────────────────────────────────────────────────────────────

export const plansApi = {
  list: async () => {
    const res = await api.get('/plans');
    return res.data;
  },
};

// ── Nodes ─────────────────────────────────────────────────────────────────────

export const nodesApi = {
  list: async () => {
    const res = await api.get('/nodes');
    return res.data;
  },
  adminList: async () => {
    const res = await api.get('/nodes/admin/all');
    return res.data;
  },
  create: async (data: Record<string, unknown>) => {
    const res = await api.post('/nodes', data);
    return res.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    const res = await api.put(`/nodes/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/nodes/${id}`);
    return res.data;
  },
};

// ── Tickets ───────────────────────────────────────────────────────────────────

export const ticketsApi = {
  list: async () => {
    const res = await api.get('/tickets');
    return res.data;
  },
  create: async (subject: string, message: string) => {
    const res = await api.post('/tickets', { subject, message });
    return res.data;
  },
  reply: async (ticketId: number, content: string) => {
    const res = await api.post(`/tickets/${ticketId}/reply`, { content });
    return res.data;
  },
};

// ── Orders ────────────────────────────────────────────────────────────────────

export const ordersApi = {
  list: async () => {
    const res = await api.get('/orders');
    return res.data;
  },
  checkout: async (plan_id: number, period: string = 'monthly') => {
    const res = await api.post('/orders/checkout', { plan_id, period });
    return res.data;
  },
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  listUsers: async () => {
    const res = await api.get('/users/admin/all');
    return res.data;
  },
  updateUser: async (id: number, data: Record<string, unknown>) => {
    const res = await api.patch(`/users/admin/${id}`, data);
    return res.data;
  },
  listTickets: async () => {
    const res = await api.get('/tickets/admin/all');
    return res.data;
  },
  replyTicket: async (ticketId: number, content: string) => {
    const res = await api.post(`/tickets/admin/${ticketId}/reply`, { content });
    return res.data;
  },
  listOrders: async () => {
    const res = await api.get('/orders/admin/all');
    return res.data;
  },
  listNodes: async () => {
    const res = await api.get('/nodes/admin/all');
    return res.data;
  },
  createNode: async (data: Record<string, unknown>) => {
    const res = await api.post('/nodes', data);
    return res.data;
  },
  createPlan: async (data: Record<string, unknown>) => {
    const res = await api.post('/plans', data);
    return res.data;
  },
  updatePlan: async (id: number, data: Record<string, unknown>) => {
    const res = await api.put(`/plans/${id}`, data);
    return res.data;
  },
  deletePlan: async (id: number) => {
    const res = await api.delete(`/plans/${id}`);
    return res.data;
  },
};
