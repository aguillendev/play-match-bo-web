import { httpClient } from '../utils/httpClient';

export interface LoginInput { email: string; password: string }
export interface AuthResponse { token: string; role: string }

async function login(payload: LoginInput): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

async function register(payload: {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  role: 'JUGADOR' | 'DUENO' | 'ADMINISTRADOR_CANCHA';
}): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/register', payload);
  return data;
}

export const authService = { login, register };

