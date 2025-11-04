import { httpClient } from '../utils/httpClient';
import { Reserva } from '../types';

const useMocks = (import.meta as any).env?.VITE_USE_MOCKS !== 'false';

let mockReservas: Reserva[] = [
  {
    id: 1,
    canchaId: 1,
    cliente: 'Juan Pérez',
    estado: 'confirmada',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '18:00',
    horaFin: '19:00',
    monto: 180,
  },
  {
    id: 2,
    canchaId: 1,
    cliente: 'María García',
    estado: 'pendiente',
    fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    horaInicio: '20:00',
    horaFin: '21:00',
    monto: 200,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ReservaFilters {
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  cliente?: string;
  ordenarPor?: string;
  direccion?: 'asc' | 'desc';
}

async function listarPorCancha(canchaId: number, filters?: ReservaFilters): Promise<Reserva[]> {
  if (useMocks) {
    await delay(300);
    let filtered = mockReservas.filter((reserva) => reserva.canchaId === canchaId);
    
    // Aplicar filtros en modo mock
    if (filters?.estado && filters.estado !== 'todas') {
      filtered = filtered.filter(r => r.estado === filters.estado);
    }
    if (filters?.cliente) {
      filtered = filtered.filter(r => r.cliente.toLowerCase().includes(filters.cliente!.toLowerCase()));
    }
    if (filters?.fechaDesde) {
      filtered = filtered.filter(r => r.fecha >= filters.fechaDesde!);
    }
    if (filters?.fechaHasta) {
      filtered = filtered.filter(r => r.fecha <= filters.fechaHasta!);
    }
    
    return filtered;
  }

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

async function confirmarReserva(reservaId: number): Promise<Reserva> {
  if (useMocks) {
    await delay(300);
    const reserva = mockReservas.find((r) => r.id === reservaId);
    if (reserva) {
      reserva.estado = 'confirmada';
      return reserva;
    }
    throw new Error('Reserva no encontrada');
  }

  const response = await httpClient.post<Reserva>(`/reservas/${reservaId}/confirmar`);
  return response.data;
}

async function rechazarReserva(reservaId: number): Promise<Reserva> {
  if (useMocks) {
    await delay(300);
    const reserva = mockReservas.find((r) => r.id === reservaId);
    if (reserva) {
      reserva.estado = 'cancelada';
      return reserva;
    }
    throw new Error('Reserva no encontrada');
  }

  const response = await httpClient.post<Reserva>(`/reservas/${reservaId}/rechazar`);
  return response.data;
}

export const reservaService = {
  listarPorCancha,
  confirmarReserva,
  rechazarReserva,
};
