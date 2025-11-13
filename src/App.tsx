import { useEffect, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CanchaForm from './components/CanchaForm';
import HorariosManager from './components/HorariosManager';
import ReportesView from './components/ReportesView';
import ReservasTable from './components/ReservasTable';
import CalendarioReservas from './components/CalendarioReservas';
import PerfilAdministradorCancha from './components/PerfilAdministradorCancha';
import NavigationLayout, { NavItem } from './components/NavigationLayout';
import { useCanchaStore } from './store/useCanchaStore';
import { useAuthStore } from './store/useAuthStore';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const canchas = useCanchaStore((state) => state.canchas);
  const selectedId = useCanchaStore((state) => state.selectedId);
  const { token, init } = useAuthStore((s) => ({ token: s.token, init: s.init }));
  const location = useLocation();

  useEffect(() => { init(); }, [init]);

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Canchas', path: '/canchas' },
      { label: 'Calendario', path: '/calendario' },
      { label: 'Reservas', path: '/reservas' },
      { label: 'Reportes', path: '/reportes' },
    ],
    [],
  );

  const activeCanchaId = selectedId ?? canchas[0]?.id ?? 1;

  if (!token && location.pathname !== '/login' && location.pathname !== '/register') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <NavigationLayout items={navItems}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/canchas" element={<CanchaForm />} />
              <Route path="/calendario" element={<CalendarioReservas />} />
              <Route path="/reservas" element={<ReservasTable />} />
              <Route path="/reportes" element={<ReportesView />} />
              <Route path="/perfil" element={<PerfilAdministradorCancha />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </NavigationLayout>
        }
      />
    </Routes>
  );
}

export default App;
