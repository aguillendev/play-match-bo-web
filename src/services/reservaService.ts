import { httpClient } from '../utils/httpClient';
import { Reserva } from '../types';

const useMocks = (import.meta as any).env?.VITE_USE_MOCKS !== 'false';

let mockReservas: Reserva[] = [
  {
    id: 'r-1',
    canchaId: '1',
    cliente: 'Juan Pérez',
    estado: 'confirmada',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '18:00',
    horaFin: '19:00',
    monto: 180,
  },
  {
    id: 'r-2',
    canchaId: '1',
    cliente: 'María García',
    estado: 'pendiente',
    fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    horaInicio: '20:00',
    horaFin: '21:00',
    monto: 200,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function listarPorCancha(canchaId: number): Promise<Reserva[]> {
  if (useMocks) {
    await delay(300);
    return mockReservas.filter((reserva) => reserva.canchaId === String(canchaId));
  }

  const response = await httpClient.get<Reserva[]>(`/reservas/canchas/${canchaId}`);
  return response.data;
}

export const reservaService = {
  listarPorCancha,
};
