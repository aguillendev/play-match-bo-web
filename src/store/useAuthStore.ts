import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authService } from '../services/authService';

type AuthState = {
  token?: string;
  role?: 'JUGADOR' | 'DUENO' | string;
  loading: boolean;
  error?: string;
  init: () => void;
  doLogin: (email: string, password: string) => Promise<boolean>;
  doLogout: () => void;
};

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    token: undefined,
    role: undefined,
    loading: false,
    error: undefined,
    init() {
      try {
        const token = localStorage.getItem('pm_token') || undefined;
        const role = (localStorage.getItem('pm_role') as any) || undefined;
        set({ token, role });
      } catch {}
    },
    async doLogin(email, password) {
      set({ loading: true, error: undefined });
      try {
        const { token, role } = await authService.login({ email, password });
        try {
          localStorage.setItem('pm_token', token);
          localStorage.setItem('pm_role', role);
        } catch {}
        set({ token, role, loading: false });
        return true;
      } catch (e: any) {
        console.error(e);
        const error = e?.response?.data?.message || 'Credenciales inválidas';
        set({ loading: false, error });
        return false;
      }
    },
    doLogout() {
      try {
        localStorage.removeItem('pm_token');
        localStorage.removeItem('pm_role');
      } catch {}
      set({ token: undefined, role: undefined });
    },
  })),
);

