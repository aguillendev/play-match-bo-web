import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Reserva } from '../types';
import { reservaService } from '../services/reservaService';

type ReservaState = {
  reservas: Reserva[];
  loading: boolean;
  error?: string;
  fetchReservas: (canchaId: string) => Promise<void>;
};

export const useReservaStore = create<ReservaState>()(
  devtools((set) => ({
    reservas: [],
    loading: false,
    async fetchReservas(canchaId) {
      set({ loading: true, error: undefined });
      try {
        const reservas = await reservaService.listarPorCancha(canchaId);
        set({ reservas, loading: false });
      } catch (error) {
        console.error(error);
        set({ loading: false, error: 'No se pudieron obtener las reservas' });
      }
    },
  })),
);
