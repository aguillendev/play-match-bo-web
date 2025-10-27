import { v4 as uuid } from 'uuid';
import { httpClient } from '../utils/httpClient';
import { Cancha, HorarioDisponible } from '../types';

const useMocks = (import.meta as any).env?.VITE_USE_MOCKS !== 'false';

let mockCanchas: Cancha[] = [
  {
    id: '1',
    nombre: 'PlayMatch Central',
    direccion: 'Av. Principal 123, La Paz',
    tipo: 'Fútbol 7',
    valorHora: 180,
    latitud: -16.4897,
    longitud: -68.1193,
    horarios: [
      { dia: 'Lunes', apertura: '08:00', cierre: '22:00' },
      { dia: 'Martes', apertura: '08:00', cierre: '22:00' },
      { dia: 'Miércoles', apertura: '08:00', cierre: '22:00' },
      { dia: 'Jueves', apertura: '08:00', cierre: '22:00' },
      { dia: 'Viernes', apertura: '08:00', cierre: '00:00' },
      { dia: 'Sábado', apertura: '08:00', cierre: '00:00' },
      { dia: 'Domingo', apertura: '09:00', cierre: '20:00' },
    ],
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function listar(): Promise<Cancha[]> {
  if (useMocks) {
    await delay(300);
    return [...mockCanchas];
  }

  const response = await httpClient.get<Cancha[]>('/canchas');
  return response.data;
}

async function crear(
  payload: Omit<Cancha, 'id' | 'horarios'> & { horarios?: HorarioDisponible[] },
): Promise<Cancha> {
  if (useMocks) {
    await delay(500);
    const nueva: Cancha = {
      ...payload,
      id: uuid(),
      horarios: payload.horarios ?? [],
    };
    mockCanchas = [...mockCanchas, nueva];
    return nueva;
  }

  const response = await httpClient.post<Cancha>('/canchas', payload);
  return response.data;
}

async function actualizarHorarios(id: string, horarios: HorarioDisponible[]): Promise<Cancha> {
  if (useMocks) {
    await delay(500);
    mockCanchas = mockCanchas.map((cancha) => (cancha.id === id ? { ...cancha, horarios } : cancha));
    const found = mockCanchas.find((c) => c.id === id);
    if (!found) {
      throw new Error('Cancha no encontrada');
    }
    return found;
  }

  const response = await httpClient.put<Cancha>(`/canchas/${id}/horarios`, { horarios });
  return response.data;
}

export const canchaService = {
  listar,
  crear,
  actualizarHorarios,
};
