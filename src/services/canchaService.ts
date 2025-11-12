import { httpClient } from '../utils/httpClient';
import { Cancha, HorarioIntervalo, Deporte } from '../types';

async function listar(): Promise<Cancha[]> {
  const response = await httpClient.get<any[]>('/canchas');
  return response.data.map(fromApi);
}

async function crear(payload: Omit<Cancha, 'id'>): Promise<Cancha> {
  const response = await httpClient.post<any>('/canchas', toApiRequest(payload));
  return fromApi(response.data);
}

async function actualizarHorarios(id: number, horarios: HorarioIntervalo[]): Promise<Cancha> {
  // Obtener datos actuales para cumplir validaciones del backend
  const currentList = await listar();
  const current = currentList.find((c) => c.id === id);
  if (!current) throw new Error('Cancha no encontrada');
  const body = toApiRequest({ ...current, horarios });
  const response = await httpClient.put<any>(`/canchas/${id}/horarios`, body);
  return fromApi(response.data);
}

async function actualizar(id: number, payload: Omit<Cancha, 'id'>): Promise<Cancha> {
  const response = await httpClient.put<any>(`/canchas/${id}`, toApiRequest(payload));
  return fromApi(response.data);
}

async function eliminar(id: number): Promise<void> {
  await httpClient.delete(`/canchas/${id}`);
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

