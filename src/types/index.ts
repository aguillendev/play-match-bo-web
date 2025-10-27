export type CanchaTipo = 'Fútbol 5' | 'Fútbol 7' | 'Fútbol 11' | 'Pádel' | 'Básquet';

export interface HorarioDisponible {
  dia: string;
  apertura: string;
  cierre: string;
}

export interface Cancha {
  id: string;
  nombre: string;
  direccion: string;
  tipo: CanchaTipo;
  valorHora: number;
  latitud?: number;
  longitud?: number;
  horarios: HorarioDisponible[];
}

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada';

export interface Reserva {
  id: string;
  canchaId: string;
  cliente: string;
  estado: EstadoReserva;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  monto: number;
}

export interface ReporteUso {
  periodo: 'dia' | 'semana' | 'mes';
  totalReservas: number;
  totalRecaudado: number;
  ocupacionPorcentaje: number;
  series: Array<{ etiqueta: string; reservas: number; recaudacion: number }>;
}

export interface DuenoPerfil {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  documento: string;
  fechaRegistro: string;
}
