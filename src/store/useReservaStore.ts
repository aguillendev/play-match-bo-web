import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Reserva } from '../types';
import { reservaService, ReservaFilters } from '../services/reservaService';

type ReservaState = {
  reservas: Reserva[];
  loading: boolean;
  error?: string;
  fetchReservas: (canchaId: number, filters?: ReservaFilters) => Promise<void>;
  fetchReservasAdministrador: (filters?: ReservaFilters) => Promise<void>;
  confirmarReserva: (reservaId: number) => Promise<void>;
  rechazarReserva: (reservaId: number) => Promise<void>;
  confirmarTodasReservas: () => Promise<void>;
};

export const useReservaStore = create<ReservaState>()(
  devtools((set) => ({
    reservas: [],
    loading: false,
    async fetchReservas(canchaId, filters) {
      set({ loading: true, error: undefined });
      try {
        const reservas = await reservaService.listarPorCancha(canchaId, filters);
        set({ reservas, loading: false });
      } catch (error: any) {
        console.error(error);
        let errorMsg = 'No se pudieron obtener las reservas';
        
        if (error?.response?.status === 404) {
          errorMsg = 'La cancha no existe o no tiene reservas registradas';
        } else if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
        }
        
        set({ reservas: [], loading: false, error: errorMsg });
      }
    },
    async fetchReservasAdministrador(filters) {
      set({ loading: true, error: undefined });
      try {
        const reservas = await reservaService.listarDelAdministrador(filters);
        set({ reservas, loading: false });
      } catch (error: any) {
        console.error(error);
        let errorMsg = 'No se pudieron obtener las reservas';
        
        if (error?.response?.status === 404) {
          errorMsg = 'No tiene canchas registradas o no hay reservas';
        } else if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
        }
        
        set({ reservas: [], loading: false, error: errorMsg });
      }
    },
    async confirmarReserva(reservaId) {
      set({ loading: true, error: undefined });
      try {
        const reservaActualizada = await reservaService.confirmarReserva(reservaId);
        set((state) => ({
          reservas: state.reservas.map((r) => (r.id === reservaId ? reservaActualizada : r)),
          loading: false,
        }));
      } catch (error: any) {
        console.error(error);
        let errorMsg = 'No se pudo confirmar la reserva';
        
        if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
        }
        
        set({ loading: false, error: errorMsg });
        throw error;
      }
    },
    async rechazarReserva(reservaId) {
      set({ loading: true, error: undefined });
      try {
        const reservaActualizada = await reservaService.rechazarReserva(reservaId);
        set((state) => ({
          reservas: state.reservas.map((r) => (r.id === reservaId ? reservaActualizada : r)),
          loading: false,
        }));
      } catch (error: any) {
        console.error(error);
        let errorMsg = 'No se pudo rechazar la reserva';
        
        if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
        }
        
        set({ loading: false, error: errorMsg });
        throw error;
      }
    },
    async confirmarTodasReservas() {
      set({ loading: true, error: undefined });
      try {
        await reservaService.confirmarTodasReservas();
        // Actualizar todas las reservas pendientes a confirmadas
        set((state) => ({
          reservas: state.reservas.map((r) => 
            r.estado === 'pendiente' ? { ...r, estado: 'confirmada' as const } : r
          ),
          loading: false,
        }));
      } catch (error: any) {
        console.error(error);
        let errorMsg = 'No se pudieron confirmar las reservas';
        
        if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
        }
        
        set({ loading: false, error: errorMsg });
        throw error;
      }
    },
  })),
);
