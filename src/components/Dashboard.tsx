import { useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { useCanchaStore } from '../store/useCanchaStore';
import { useReservaStore } from '../store/useReservaStore';
import { useReporteStore } from '../store/useReporteStore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const Dashboard = () => {
  const theme = useTheme();
  const { canchas, loading: loadingCanchas, fetchCanchas, selectedId } = useCanchaStore((state) => ({
    canchas: state.canchas,
    loading: state.loading,
    fetchCanchas: state.fetchCanchas,
    selectedId: state.selectedId,
  }));
  const { reservas, loading: loadingReservas, fetchReservasAdministrador } = useReservaStore((state) => ({
    reservas: state.reservas,
    loading: state.loading,
    fetchReservasAdministrador: state.fetchReservasAdministrador,
  }));
  const { reporte, loading: loadingReporte, fetchReporte } = useReporteStore((state) => ({
    reporte: state.reporte,
    loading: state.loading,
    fetchReporte: state.fetchReporte,
  }));

  useEffect(() => {
    fetchCanchas();
    fetchReservasAdministrador(); // Cargar todas las reservas del administrador
  }, [fetchCanchas, fetchReservasAdministrador]);

  useEffect(() => {
    if (selectedId) {
      fetchReporte(selectedId, 'semana');
    }
  }, [selectedId, fetchReporte]);

  const canchaActiva = useMemo(() => canchas.find((c) => c.id === selectedId), [canchas, selectedId]);

  const resumen = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const confirmadas = reservas.filter((r) => r.estado === 'confirmada');
    const pendientes = reservas.filter((r) => r.estado === 'pendiente');
    
    // Ingresos confirmados: solo reservas confirmadas cuya fecha ya pasó
    const reservasJugadas = confirmadas.filter((r) => {
      const fechaReserva = new Date(r.fecha);
      fechaReserva.setHours(0, 0, 0, 0);
      return fechaReserva < hoy;
    });
    
    return {
      totalCanchas: canchas.length,
      reservasConfirmadas: confirmadas.length,
      reservasPendientes: pendientes.length,
      montoConfirmado: reservasJugadas.reduce((sum, r) => sum + r.monto, 0),
    };
  }, [canchas.length, reservas]);

  const isLoading = loadingCanchas || loadingReservas || loadingReporte;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ¡Bienvenido nuevamente!
      </Typography>
      {isLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      {!isLoading && !canchaActiva && (
        <Alert severity="info">Aún no tienes canchas registradas. Crea tu primera cancha para comenzar.</Alert>
      )}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: '#fff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: 'translateY(-2px)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  }}
                >
                  <SportsSoccerIcon sx={{ color: '#64748b', fontSize: 28 }} />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500} mb={0.5} sx={{ fontSize: '0.75rem' }}>
                Canchas registradas
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#1e293b" sx={{ fontSize: '1.5rem' }}>
                {resumen.totalCanchas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: '#fff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: 'translateY(-2px)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  }}
                >
                  <EventIcon sx={{ color: '#059669', fontSize: 28 }} />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500} mb={0.5} sx={{ fontSize: '0.75rem' }}>
                Reservas confirmadas
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#1e293b" sx={{ fontSize: '1.5rem' }}>
                {resumen.reservasConfirmadas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: '#fff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: 'translateY(-2px)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  }}
                >
                  <TrendingUpIcon sx={{ color: '#d97706', fontSize: 28 }} />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500} mb={0.5} sx={{ fontSize: '0.75rem' }}>
                Reservas pendientes
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#1e293b" sx={{ fontSize: '1.5rem' }}>
                {resumen.reservasPendientes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: '#fff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: 'translateY(-2px)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
                  }}
                >
                  <AttachMoneyIcon sx={{ color: '#7c3aed', fontSize: 28 }} />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500} mb={0.5} sx={{ fontSize: '0.75rem' }}>
                Ingresos confirmados
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#1e293b" sx={{ fontSize: '1.5rem' }}>
                ${resumen.montoConfirmado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <CardContent sx={{ pb: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Ocupación semanal
                </Typography>
              </Box>
              {reporte?.series && (
                <Box sx={{ height: 320, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reporte.series} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReservasBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0d9488" stopOpacity={1} />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis 
                        dataKey="etiqueta" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 12 }}
                        width={50}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: 8,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        cursor={{ fill: 'rgba(13, 148, 136, 0.05)' }}
                      />
                      <Bar 
                        dataKey="reservas" 
                        fill="url(#colorReservasBar)"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <CardContent sx={{ pb: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <AttachMoneyIcon sx={{ mr: 1, color: '#f97316' }} />
                <Typography variant="h6" fontWeight={600}>
                  Recaudación semanal
                </Typography>
              </Box>
              {reporte?.series && (
                <Box sx={{ height: 320, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reporte.series} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRecaudacion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis 
                        dataKey="etiqueta"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 12 }}
                        width={50}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: 8,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '5 5' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="recaudacion" 
                        stroke="#f97316" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRecaudacion)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
