import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Cancha, HorarioDisponible } from '../types';
import { canchaService } from '../services/canchaService';

type CanchaState = {
  canchas: Cancha[];
  loading: boolean;
  error?: string;
  selectedId?: string;
  fetchCanchas: () => Promise<void>;
  addCancha: (payload: Omit<Cancha, 'id' | 'horarios'> & { horarios?: HorarioDisponible[] }) => Promise<Cancha | undefined>;
  updateHorarios: (id: string, horarios: HorarioDisponible[]) => Promise<void>;
};

export const useCanchaStore = create<CanchaState>()(
  devtools((set, get) => ({
    canchas: [],
    loading: false,
    selectedId: undefined,
    async fetchCanchas() {
      set({ loading: true, error: undefined });
      try {
        const canchas = await canchaService.listar();
        set({ canchas, loading: false, selectedId: canchas[0]?.id });
      } catch (error) {
        console.error(error);
        set({ loading: false, error: 'No se pudieron cargar las canchas' });
      }
    },
    async addCancha(payload) {
      set({ loading: true, error: undefined });
      try {
        const nueva = await canchaService.crear(payload);
        set({
          canchas: [...get().canchas, nueva],
          loading: false,
          selectedId: nueva.id,
        });
        return nueva;
      } catch (error) {
        console.error(error);
        set({ loading: false, error: 'No se pudo registrar la cancha' });
      }
    },
    async updateHorarios(id, horarios) {
      set({ loading: true, error: undefined });
      try {
        const actualizada = await canchaService.actualizarHorarios(id, horarios);
        set({
          loading: false,
          canchas: get().canchas.map((c) => (c.id === id ? actualizada : c)),
        });
      } catch (error) {
        console.error(error);
        set({ loading: false, error: 'No se pudieron guardar los horarios' });
      }
    },
  })),
);
