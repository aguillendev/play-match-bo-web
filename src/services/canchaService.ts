import { httpClient } from '../utils/httpClient';
import { Cancha, HorarioIntervalo, Deporte } from '../types';

const useMocks = (import.meta as any).env?.VITE_USE_MOCKS !== 'false';

let mockCanchas: Cancha[] = [
  {
    id: 1,
    nombre: 'PlayMatch Central',
    direccion: 'Av. Principal 123, La Paz',
    tipo: 'PADEL',
    precioHora: 180,
    latitud: -16.4897,
    longitud: -68.1193,
    horarios: [
      { inicio: '09:00', fin: '12:00' },
      { inicio: '16:00', fin: '23:00' },
    ],
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function listar(): Promise<Cancha[]> {
  if (useMocks) {
    await delay(300);
    return [...mockCanchas];
  }

  const response = await httpClient.get<any[]>('/canchas');
  return response.data.map(fromApi);
}

async function crear(payload: Omit<Cancha, 'id'>): Promise<Cancha> {
  if (useMocks) {
    await delay(500);
    const nueva: Cancha = { ...payload, id: Math.floor(Math.random() * 100000) };
    mockCanchas = [...mockCanchas, nueva];
    return nueva;
  }

  const response = await httpClient.post<any>('/canchas', toApiRequest(payload));
  return fromApi(response.data);
}

async function actualizarHorarios(id: number, horarios: HorarioIntervalo[]): Promise<Cancha> {
  if (useMocks) {
    await delay(500);
    mockCanchas = mockCanchas.map((cancha) => (cancha.id === id ? { ...cancha, horarios } : cancha));
    const found = mockCanchas.find((c) => c.id === id);
    if (!found) {
      throw new Error('Cancha no encontrada');
    }
    return found;
  }

  // Obtener datos actuales para cumplir validaciones del backend
  const currentList = await listar();
  const current = currentList.find((c) => c.id === id);
  if (!current) throw new Error('Cancha no encontrada');
  const body = toApiRequest({ ...current, horarios });
  const response = await httpClient.put<any>(`/canchas/${id}/horarios`, body);
  return fromApi(response.data);
}

export const canchaService = {
  listar,
  crear,
  actualizarHorarios,
  actualizar,
  eliminar,
};

// Mappers
function fromApi(c: any): Cancha {
  return {
    id: c.id,
    nombre: c.nombre,
    direccion: c.direccion,
    tipo: c.tipo as Deporte,
    precioHora: Number(c.precioHora),
    latitud: c.latitud,
    longitud: c.longitud,
    horarioApertura: c.horarioApertura ?? undefined,
    horarioCierre: c.horarioCierre ?? undefined,
    horarios: (c.horarios ?? []).map((h: any) => ({ inicio: h.inicio, fin: h.fin })),
    tieneReservasFuturas: Boolean(c.tieneReservasFuturas),
  };
}

function toApiRequest(c: Omit<Cancha, 'id'>): any {
  return {
    nombre: c.nombre,
    direccion: c.direccion,
    latitud: c.latitud,
    longitud: c.longitud,
    precioHora: c.precioHora,
    horarioApertura: c.horarioApertura ?? null,
    horarioCierre: c.horarioCierre ?? null,
    tipo: c.tipo,
    horarios: (c.horarios ?? []).map((h) => ({ inicio: h.inicio, fin: h.fin })),
  };
}

async function actualizar(id: number, payload: Omit<Cancha, 'id'>): Promise<Cancha> {
  if (useMocks) {
    await delay(300);
    mockCanchas = mockCanchas.map((c) => (c.id === id ? { ...payload, id } : c));
    const found = mockCanchas.find((c) => c.id === id)!;
    return found;
  }
  const response = await httpClient.put<any>(`/canchas/${id}`, toApiRequest(payload));
  return fromApi(response.data);
}

async function eliminar(id: number): Promise<void> {
  if (useMocks) {
    await delay(200);
    mockCanchas = mockCanchas.filter((c) => c.id !== id);
    return;
  }
  await httpClient.delete(`/canchas/${id}`);
}
