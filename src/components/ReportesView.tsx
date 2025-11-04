import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  ComposedChart,
  Area,
} from 'recharts';
import { useReporteStore } from '../store/useReporteStore';
import { ReporteUso } from '../types';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface ReportesViewProps {
  canchaId: number;
}

const ReportesView = ({ canchaId }: ReportesViewProps) => {
  const theme = useTheme();
  const { reporte, loading, fetchReporte } = useReporteStore((state) => ({
    reporte: state.reporte,
    loading: state.loading,
    fetchReporte: state.fetchReporte,
  }));
  const [periodo, setPeriodo] = useState<ReporteUso['periodo']>('mes');

  useEffect(() => {
    if (canchaId) {
      fetchReporte(canchaId, periodo);
    }
  }, [canchaId, periodo, fetchReporte]);

  const resumen = useMemo(() => {
    if (!reporte) return null;
    return {
      reservas: reporte.totalReservas,
      recaudado: reporte.totalRecaudado,
      ocupacion: reporte.ocupacionPorcentaje,
    };
  }, [reporte]);

  const handlePeriodo = (_: unknown, nuevoPeriodo: ReporteUso['periodo'] | null) => {
    if (nuevoPeriodo) {
      setPeriodo(nuevoPeriodo);
    }
  };

  const getPeriodoIcon = () => {
    switch(periodo) {
      case 'dia': return <CalendarTodayIcon />;
      case 'semana': return <DateRangeIcon />;
      case 'mes': return <CalendarMonthIcon />;
      default: return <CalendarMonthIcon />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Reportes de uso y recaudación
        </Typography>
        <ToggleButtonGroup 
          color="primary" 
          value={periodo} 
          exclusive 
          onChange={handlePeriodo}
          sx={{
            '& .MuiToggleButton-root': {
              px: 3,
              py: 1,
              fontWeight: 600,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }
            }
          }}
        >
          <ToggleButton value="dia">
            <CalendarTodayIcon sx={{ mr: 1, fontSize: 18 }} />
            Día
          </ToggleButton>
          <ToggleButton value="semana">
            <DateRangeIcon sx={{ mr: 1, fontSize: 18 }} />
            Semana
          </ToggleButton>
          <ToggleButton value="mes">
            <CalendarMonthIcon sx={{ mr: 1, fontSize: 18 }} />
            Mes
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading && <Typography>Cargando reporte...</Typography>}
      {!loading && !reporte && <Alert severity="info">Selecciona una cancha para ver sus reportes.</Alert>}
      
      {!loading && reporte && resumen && (
        <>
          {/* Tarjetas de resumen */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  color: 'white',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Total Reservas
                  </Typography>
                  <EventIcon sx={{ opacity: 0.8, fontSize: 32 }} />
                </Box>
                <Typography variant="h3" fontWeight={700}>
                  {resumen.reservas}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                  En el {periodo}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                  color: 'white',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Total Recaudado
                  </Typography>
                  <AttachMoneyIcon sx={{ opacity: 0.8, fontSize: 32 }} />
                </Box>
                <Typography variant="h3" fontWeight={700}>
                  ${resumen.recaudado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                  En el {periodo}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Ocupación
                  </Typography>
                  <ShowChartIcon sx={{ opacity: 0.8, fontSize: 32 }} />
                </Box>
                <Typography variant="h3" fontWeight={700}>
                  {resumen.ocupacion}%
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                  Porcentaje de ocupación
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Gráfico combinado */}
          <Card sx={{ 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <CardContent sx={{ pb: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                {getPeriodoIcon()}
                <Typography variant="h6" fontWeight={600} ml={1}>
                  Análisis detallado - {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                </Typography>
              </Box>
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={reporte.series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReservasReporte" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorRecaudacionBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                        <stop offset="100%" stopColor="#fb923c" stopOpacity={0.8} />
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
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                      label={{ value: 'Reservas', angle: -90, position: 'insideLeft', style: { fill: '#0d9488', fontWeight: 600 } }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                      label={{ value: 'Recaudación (ARS)', angle: 90, position: 'insideRight', style: { fill: '#f97316', fontWeight: 600 } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        padding: '12px'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'Recaudación') {
                          return [`ARS $${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="reservas" 
                      fill="url(#colorReservasReporte)"
                      stroke="#0d9488"
                      strokeWidth={2}
                      name="Reservas"
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="recaudacion" 
                      fill="url(#colorRecaudacionBar)"
                      name="Recaudación"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={50}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default ReportesView;
