import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ReporteUso } from '../types';
import { reporteService } from '../services/reporteService';

type ReporteState = {
  reporte?: ReporteUso;
  loading: boolean;
  error?: string;
  fetchReporte: (canchaId: number, periodo: ReporteUso['periodo']) => Promise<void>;
  fetchReporteGeneral: (periodo: ReporteUso['periodo']) => Promise<void>;
};

export const useReporteStore = create<ReporteState>()(
  devtools((set) => ({
    reporte: undefined,
    loading: false,
    async fetchReporte(canchaId, periodo) {
      set({ loading: true, error: undefined });
      try {
        const reporte = await reporteService.obtener({ canchaId, periodo });
        set({ reporte, loading: false });
      } catch (error) {
        console.error(error);
        set({ loading: false, error: 'No se pudo generar el reporte' });
      }
    },
    async fetchReporteGeneral(periodo) {
      set({ loading: true, error: undefined });
      try {
        const reporte = await reporteService.obtenerGeneral(periodo);
        set({ reporte, loading: false });
      } catch (error) {
        console.error(error);
        set({ loading: false, error: 'No se pudo generar el reporte general' });
      }
    },
  })),
);
