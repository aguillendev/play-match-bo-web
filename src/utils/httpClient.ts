import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const httpClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Helper para decodificar el token JWT y extraer el userId
export const getUserIdFromToken = (): number | null => {
  try {
    const token = localStorage.getItem('pm_token');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || null;
  } catch {
    return null;
  }
};

// Attach Authorization header if token exists
httpClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('pm_token');
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Handle 401 globally: clear token and optionally redirect
httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      try {
        localStorage.removeItem('pm_token');
        localStorage.removeItem('pm_role');
      } catch {}
      // Best-effort redirect without coupling to router
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  },
);
