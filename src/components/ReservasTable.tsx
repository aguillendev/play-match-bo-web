import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useReservaStore } from '../store/useReservaStore';
import { EstadoReserva } from '../types';

interface ReservasTableProps {
  canchaId: number;
}

const estadoLabels: Record<EstadoReserva, string> = {
  confirmada: 'Confirmada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
};

const colorPorEstado: Record<EstadoReserva, 'success' | 'warning' | 'default'> = {
  confirmada: 'success',
  pendiente: 'warning',
  cancelada: 'default',
};

const ReservasTable = ({ canchaId }: ReservasTableProps) => {
  const { reservas, loading, fetchReservas } = useReservaStore((state) => ({
    reservas: state.reservas,
    loading: state.loading,
    fetchReservas: state.fetchReservas,
  }));
  const [filtro, setFiltro] = useState<'todas' | EstadoReserva>('todas');

  useEffect(() => {
    if (canchaId) {
      fetchReservas(canchaId);
    }
  }, [canchaId, fetchReservas]);

  const reservasFiltradas = useMemo(() => {
    if (filtro === 'todas') return reservas;
    return reservas.filter((reserva) => reserva.estado === filtro);
  }, [filtro, reservas]);

  const handleChange = (event: SelectChangeEvent) => {
    setFiltro(event.target.value as 'todas' | EstadoReserva);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reservas de la cancha
      </Typography>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
            <Typography variant="subtitle1">Total: {reservasFiltradas.length} reservas</Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Estado</InputLabel>
              <Select value={filtro} label="Estado" onChange={handleChange}>
                <MenuItem value="todas">Todas</MenuItem>
                <MenuItem value="pendiente">Pendientes</MenuItem>
                <MenuItem value="confirmada">Confirmadas</MenuItem>
                <MenuItem value="cancelada">Canceladas</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {loading ? (
            <Typography>Cargando reservas...</Typography>
          ) : reservasFiltradas.length === 0 ? (
            <Alert severity="info">No hay reservas para el filtro seleccionado.</Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Horario</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Monto (Bs.)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservasFiltradas.map((reserva) => (
                  <TableRow key={reserva.id} hover>
                    <TableCell>{reserva.cliente}</TableCell>
                    <TableCell>{new Date(reserva.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {reserva.horaInicio} - {reserva.horaFin}
                    </TableCell>
                    <TableCell>
                      <Chip label={estadoLabels[reserva.estado]} color={colorPorEstado[reserva.estado]} size="small" />
                    </TableCell>
                    <TableCell align="right">{reserva.monto.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReservasTable;
