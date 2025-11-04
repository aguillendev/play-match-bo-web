export type Deporte = 'FUTBOL' | 'PADEL' | 'TENIS' | 'BASQUET' | 'OTRO';

export interface HorarioIntervalo {
  inicio: string; // HH:mm[:ss]
  fin: string; // HH:mm[:ss]
}

export interface Cancha {
  id: number;
  nombre: string;
  direccion: string;
  tipo: Deporte;
  precioHora: number;
  latitud?: number;
  longitud?: number;
  horarioApertura?: string;
  horarioCierre?: string;
  horarios: HorarioIntervalo[];
  tieneReservasFuturas?: boolean;
}

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada';

export interface Reserva {
  id: number;
  canchaId: number;
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
