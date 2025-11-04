import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  Grid,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { useReservaStore } from '../store/useReservaStore';
import { EstadoReserva } from '../types';
import { ReservaFilters } from '../services/reservaService';

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

type OrderBy = 'fecha' | 'hora' | 'cliente' | 'estado' | 'monto';

const ReservasTable = ({ canchaId }: ReservasTableProps) => {
  const { reservas, loading, error, fetchReservas, confirmarReserva, rechazarReserva } = useReservaStore((state) => ({
    reservas: state.reservas,
    loading: state.loading,
    error: state.error,
    fetchReservas: state.fetchReservas,
    confirmarReserva: state.confirmarReserva,
    rechazarReserva: state.rechazarReserva,
  }));
  
  const [filtro, setFiltro] = useState<'todas' | EstadoReserva>('todas');
  const [cliente, setCliente] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [orderBy, setOrderBy] = useState<OrderBy>('fecha');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (canchaId) {
      const filters: ReservaFilters = {
        estado: filtro,
        cliente: cliente || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        ordenarPor: orderBy,
        direccion: order,
      };
      fetchReservas(canchaId, filters);
    }
  }, [canchaId, filtro, cliente, fechaDesde, fechaHasta, orderBy, order, fetchReservas]);

  const handleEstadoChange = (event: SelectChangeEvent) => {
    setFiltro(event.target.value as 'todas' | EstadoReserva);
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleConfirmar = async (reservaId: number) => {
    try {
      await confirmarReserva(reservaId);
    } catch (err) {
      // Error ya manejado en el store
    }
  };

  const handleRechazar = async (reservaId: number) => {
    try {
      await rechazarReserva(reservaId);
    } catch (err) {
      // Error ya manejado en el store
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reservas de la cancha
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select value={filtro} label="Estado" onChange={handleEstadoChange}>
                  <MenuItem value="todas">Todas</MenuItem>
                  <MenuItem value="pendiente">Pendientes</MenuItem>
                  <MenuItem value="confirmada">Confirmadas</MenuItem>
                  <MenuItem value="cancelada">Canceladas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Buscar por nombre"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Fecha desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Fecha hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Total: {reservas.length} reservas</Typography>
          </Box>
          
          {loading ? (
            <Typography>Cargando reservas...</Typography>
          ) : error ? (
            <Alert severity="warning">{error}</Alert>
          ) : reservas.length === 0 ? (
            <Alert severity="info">No hay reservas para el filtro seleccionado.</Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'cliente'}
                      direction={orderBy === 'cliente' ? order : 'asc'}
                      onClick={() => handleRequestSort('cliente')}
                    >
                      Cliente
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'fecha'}
                      direction={orderBy === 'fecha' ? order : 'asc'}
                      onClick={() => handleRequestSort('fecha')}
                    >
                      Fecha
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'hora'}
                      direction={orderBy === 'hora' ? order : 'asc'}
                      onClick={() => handleRequestSort('hora')}
                    >
                      Horario
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'estado'}
                      direction={orderBy === 'estado' ? order : 'asc'}
                      onClick={() => handleRequestSort('estado')}
                    >
                      Estado
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'monto'}
                      direction={orderBy === 'monto' ? order : 'asc'}
                      onClick={() => handleRequestSort('monto')}
                    >
                      Monto
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservas.map((reserva) => (
                  <TableRow key={reserva.id} hover>
                    <TableCell>{reserva.cliente}</TableCell>
                    <TableCell>{new Date(reserva.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {reserva.horaInicio} - {reserva.horaFin}
                    </TableCell>
                    <TableCell>
                      <Chip label={estadoLabels[reserva.estado]} color={colorPorEstado[reserva.estado]} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      {reserva.monto != null ? `ARS $${reserva.monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      {reserva.estado === 'pendiente' && (
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="Confirmar reserva">
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => handleConfirmar(reserva.id)}
                              disabled={loading}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rechazar reserva">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleRechazar(reserva.id)}
                              disabled={loading}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                      {reserva.estado !== 'pendiente' && <Typography variant="caption" color="text.secondary">-</Typography>}
                    </TableCell>
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
