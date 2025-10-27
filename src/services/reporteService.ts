import { httpClient } from '../utils/httpClient';
import { ReporteUso } from '../types';

const useMocks = (import.meta as any).env?.VITE_USE_MOCKS !== 'false';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ObtenerReporteInput {
  canchaId: string;
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

  const response = await httpClient.get<ReporteUso>(`/reportes/reservas`, {
    params: { periodo, canchaId },
  });
  return response.data;
}

export const reporteService = {
  obtener,
};
