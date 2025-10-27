import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
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
} from 'recharts';
import { useReporteStore } from '../store/useReporteStore';
import { ReporteUso } from '../types';

interface ReportesViewProps {
  canchaId: string;
}

const ReportesView = ({ canchaId }: ReportesViewProps) => {
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reportes de uso y recaudación
      </Typography>
      <ToggleButtonGroup color="primary" value={periodo} exclusive onChange={handlePeriodo} sx={{ mb: 3 }}>
        <ToggleButton value="dia">Día</ToggleButton>
        <ToggleButton value="semana">Semana</ToggleButton>
        <ToggleButton value="mes">Mes</ToggleButton>
      </ToggleButtonGroup>
      {loading && <Typography>Cargando reporte...</Typography>}
      {!loading && !reporte && <Alert severity="info">Selecciona una cancha para ver sus reportes.</Alert>}
      {!loading && reporte && resumen && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Periodo seleccionado: {periodo.toUpperCase()}
            </Typography>
            <Typography variant="body1">Reservas: {resumen.reservas}</Typography>
            <Typography variant="body1">Recaudado (Bs.): {resumen.recaudado.toFixed(2)}</Typography>
            <Typography variant="body1">Ocupación: {resumen.ocupacion}%</Typography>
            <Box sx={{ height: 320, mt: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reporte.series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="etiqueta" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reservas" fill="#0d9488" name="Reservas" />
                  <Bar dataKey="recaudacion" fill="#f97316" name="Recaudación" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ReportesView;
