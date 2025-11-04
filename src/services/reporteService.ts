import { httpClient } from '../utils/httpClient';
import { ReporteUso } from '../types';

const useMocks = (import.meta as any).env?.VITE_USE_MOCKS !== 'false';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ObtenerReporteInput {
  canchaId: number;
  periodo: ReporteUso['periodo'];
}

async function obtener({ canchaId, periodo }: ObtenerReporteInput): Promise<ReporteUso> {
  if (useMocks) {
    await delay(350);
    const etiquetasPorPeriodo: Record<ReporteUso['periodo'], string[]> = {
      dia: Array.from({ length: 6 }, (_, i) => `${16 + i}:00`),
      semana: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      mes: Array.from({ length: 4 }, (_, i) => `Semana ${i + 1}`),
    };

    const series = etiquetasPorPeriodo[periodo].map((etiqueta, idx) => ({
      etiqueta,
      reservas: Math.floor(Math.random() * 10) + 2 + idx,
      recaudacion: Math.floor(Math.random() * 400) + 200,
    }));

    const totalReservas = series.reduce((sum, item) => sum + item.reservas, 0);
    const totalRecaudado = series.reduce((sum, item) => sum + item.recaudacion, 0);

    return {
      periodo,
      totalReservas,
      totalRecaudado,
      ocupacionPorcentaje: Math.min(100, Math.round((totalReservas / 40) * 100)),
      series,
    };
  }

  // Backend returns List<ReporteReservasResponse> with: fecha, horaInicio, horaFin, totalReservas, recaudacion
  const response = await httpClient.get<Array<{ 
    fecha: string; 
    horaInicio?: string; 
    horaFin?: string; 
    totalReservas: number; 
    recaudacion: number;
  }>>(`/reportes/reservas`, {
    params: { periodo, canchaId },
  });

  // Transform backend response to frontend format
  const data = response.data;
  
  // Create series based on period
  const series = data.map(item => {
    let etiqueta: string;
    
    if (periodo === 'dia' && item.horaInicio) {
      // Para "día", mostrar el rango horario
      const horaInicio = item.horaInicio.substring(0, 5); // "HH:mm"
      const horaFin = item.horaFin?.substring(0, 5) || '';
      etiqueta = `${horaInicio} - ${horaFin}`;
    } else {
      // Para "semana" y "mes", mostrar la fecha
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
  const date = new Date(fecha + 'T12:00:00'); // Agregar hora para evitar problemas de zona horaria
  
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
