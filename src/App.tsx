import { useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CanchaForm from './components/CanchaForm';
import HorariosManager from './components/HorariosManager';
import ReportesView from './components/ReportesView';
import ReservasTable from './components/ReservasTable';
import PerfilDueno from './components/PerfilDueno';
import NavigationLayout, { NavItem } from './components/NavigationLayout';
import { useCanchaStore } from './store/useCanchaStore';

function App() {
  const canchas = useCanchaStore((state) => state.canchas);

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Canchas', path: '/canchas' },
      { label: 'Horarios', path: '/horarios' },
      { label: 'Reservas', path: '/reservas' },
      { label: 'Reportes', path: '/reportes' },
      { label: 'Perfil', path: '/perfil' },
    ],
    [],
  );

  const defaultCanchaId = canchas[0]?.id ?? '1';

  return (
    <NavigationLayout items={navItems}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/canchas" element={<CanchaForm />} />
        <Route path="/horarios" element={<HorariosManager canchaId={defaultCanchaId} />} />
        <Route path="/reservas" element={<ReservasTable canchaId={defaultCanchaId} />} />
        <Route path="/reportes" element={<ReportesView canchaId={defaultCanchaId} />} />
        <Route path="/perfil" element={<PerfilDueno />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </NavigationLayout>
  );
}

export default App;
