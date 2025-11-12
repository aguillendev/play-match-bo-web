import { httpClient } from '../utils/httpClient';
import { Reserva } from '../types';

export interface ReservaFilters {
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  cliente?: string;
  canchaId?: number;
  ordenarPor?: string;
  direccion?: 'asc' | 'desc';
}

async function listarPorCancha(canchaId: number, filters?: ReservaFilters): Promise<Reserva[]> {
  const params = new URLSearchParams();
  if (filters?.estado && filters.estado !== 'todas') params.append('estado', filters.estado.toUpperCase());
  if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
  if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
  if (filters?.cliente) params.append('cliente', filters.cliente);
  if (filters?.ordenarPor) params.append('ordenarPor', filters.ordenarPor);
  if (filters?.direccion) params.append('direccion', filters.direccion);

  const response = await httpClient.get<Reserva[]>(`/reservas/canchas/${canchaId}?${params.toString()}`);
  return response.data;
}

async function listarDelAdministrador(filters?: ReservaFilters): Promise<Reserva[]> {
  const params = new URLSearchParams();
  if (filters?.estado && filters.estado !== 'todas') params.append('estado', filters.estado.toUpperCase());
  if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
  if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
  if (filters?.cliente) params.append('cliente', filters.cliente);
  if (filters?.canchaId) params.append('canchaId', String(filters.canchaId));
  if (filters?.ordenarPor) params.append('ordenarPor', filters.ordenarPor);
  if (filters?.direccion) params.append('direccion', filters.direccion);

  const response = await httpClient.get<Reserva[]>(`/reservas/administrador?${params.toString()}`);
  return response.data;
}

async function confirmarReserva(reservaId: number): Promise<Reserva> {
  const response = await httpClient.post<Reserva>(`/reservas/${reservaId}/confirmar`);
  return response.data;
}

async function rechazarReserva(reservaId: number): Promise<Reserva> {
  const response = await httpClient.post<Reserva>(`/reservas/${reservaId}/rechazar`);
  return response.data;
}

export const reservaService = {
  listarPorCancha,
  listarDelAdministrador,
  confirmarReserva,
  rechazarReserva,
};

