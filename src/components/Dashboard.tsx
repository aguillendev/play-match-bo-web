import { useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCanchaStore } from '../store/useCanchaStore';
import { useReservaStore } from '../store/useReservaStore';
import { useReporteStore } from '../store/useReporteStore';

const Dashboard = () => {
  const { canchas, loading: loadingCanchas, fetchCanchas, selectedId } = useCanchaStore((state) => ({
    canchas: state.canchas,
    loading: state.loading,
    fetchCanchas: state.fetchCanchas,
    selectedId: state.selectedId,
  }));
  const { reservas, loading: loadingReservas, fetchReservas } = useReservaStore((state) => ({
    reservas: state.reservas,
    loading: state.loading,
    fetchReservas: state.fetchReservas,
  }));
  const { reporte, loading: loadingReporte, fetchReporte } = useReporteStore((state) => ({
    reporte: state.reporte,
    loading: state.loading,
    fetchReporte: state.fetchReporte,
  }));

  useEffect(() => {
    fetchCanchas();
  }, [fetchCanchas]);

  useEffect(() => {
    if (selectedId) {
      fetchReservas(selectedId);
      fetchReporte(selectedId, 'semana');
    }
  }, [selectedId, fetchReservas, fetchReporte]);

  const canchaActiva = useMemo(() => canchas.find((c) => c.id === selectedId), [canchas, selectedId]);

  const resumen = useMemo(() => {
    const confirmadas = reservas.filter((r) => r.estado === 'confirmada');
    const pendientes = reservas.filter((r) => r.estado === 'pendiente');
    return {
      totalCanchas: canchas.length,
      reservasConfirmadas: confirmadas.length,
      reservasPendientes: pendientes.length,
      montoConfirmado: confirmadas.reduce((sum, r) => sum + r.monto, 0),
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
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Canchas registradas
              </Typography>
              <Typography variant="h4">{resumen.totalCanchas}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Reservas confirmadas
              </Typography>
              <Typography variant="h4">{resumen.reservasConfirmadas}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Reservas pendientes
              </Typography>
              <Typography variant="h4">{resumen.reservasPendientes}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ingresos confirmados (Bs.)
              </Typography>
              <Typography variant="h4">{resumen.montoConfirmado.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ocupación semanal
              </Typography>
              {reporte?.series && (
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reporte.series}>
                      <defs>
                        <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="etiqueta" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="reservas" stroke="#0d9488" fillOpacity={1} fill="url(#colorReservas)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recaudación semanal (Bs.)
              </Typography>
              {reporte?.series && (
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reporte.series}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="etiqueta" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="recaudacion" stroke="#f97316" fill="#f97316" fillOpacity={0.35} />
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
