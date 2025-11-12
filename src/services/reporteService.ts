import { httpClient } from '../utils/httpClient';
import { ReporteUso } from '../types';

interface ObtenerReporteInput {
  canchaId: number;
  periodo: ReporteUso['periodo'];
}

async function obtener({ canchaId, periodo }: ObtenerReporteInput): Promise<ReporteUso> {
  const response = await httpClient.get<Array<{
    fecha: string;
    horaInicio?: string;
    horaFin?: string;
    totalReservas: number;
    recaudacion: number;
  }>>(`/reportes/reservas`, {
    params: { periodo, canchaId },
  });

  const data = response.data;

  const series = data.map((item) => {
    let etiqueta: string;
    if (periodo === 'dia' && item.horaInicio) {
      const horaInicio = item.horaInicio.substring(0, 5);
      const horaFin = item.horaFin?.substring(0, 5) || '';
      etiqueta = `${horaInicio} - ${horaFin}`;
    } else {
      etiqueta = formatDateLabel(item.fecha, periodo);
    }
    return {
      etiqueta,
      reservas: item.totalReservas,
      recaudacion: item.recaudacion,
    };
  });

  const totalReservas = data.reduce((sum, item) => sum + item.totalReservas, 0);
  const totalRecaudado = data.reduce((sum, item) => sum + item.recaudacion, 0);

  return {
    periodo,
    totalReservas,
    totalRecaudado,
    ocupacionPorcentaje: Math.min(100, Math.round((totalReservas / 40) * 100)),
    series,
  };
}

function formatDateLabel(fecha: string, periodo: ReporteUso['periodo']): string {
  const date = new Date(fecha + 'T12:00:00');
  if (periodo === 'dia') {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  } else if (periodo === 'semana') {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[date.getDay()];
  } else {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
}

export const reporteService = {
  obtener,
};

