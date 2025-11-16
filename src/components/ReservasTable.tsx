import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
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
import { CheckCircle, Cancel, Check } from '@mui/icons-material';
import { useReservaStore } from '../store/useReservaStore';
import { useCanchaStore } from '../store/useCanchaStore';
import { EstadoReserva } from '../types';
import { ReservaFilters } from '../services/reservaService';

interface ReservasTableProps {
  canchaId?: number; // Ahora es opcional
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

const deporteLabels: Record<string, string> = {
  FUTBOL: 'Fútbol',
  PADEL: 'Pádel',
  TENIS: 'Tenis',
  BASQUET: 'Básquet',
  OTRO: 'Otro',
};

type OrderBy = 'fecha' | 'hora' | 'cliente' | 'estado' | 'monto';

const ReservasTable = ({ canchaId }: ReservasTableProps) => {
  const { reservas, loading, error, fetchReservas, fetchReservasAdministrador, confirmarReserva, rechazarReserva, confirmarTodasReservas } = useReservaStore((state) => ({
    reservas: state.reservas,
    loading: state.loading,
    error: state.error,
    fetchReservas: state.fetchReservas,
    fetchReservasAdministrador: state.fetchReservasAdministrador,
    confirmarReserva: state.confirmarReserva,
    rechazarReserva: state.rechazarReserva,
    confirmarTodasReservas: state.confirmarTodasReservas,
  }));

  const { canchas, fetchCanchas } = useCanchaStore((state) => ({
    canchas: state.canchas,
    fetchCanchas: state.fetchCanchas,
  }));
  
  // Función para formatear fecha sin problemas de zona horaria
  const formatearFecha = (fechaStr: string): string => {
    const [year, month, day] = fechaStr.split('-');
    return `${day}/${month}/${year}`;
  };
  
  const [filtro, setFiltro] = useState<'todas' | EstadoReserva>('todas');
  const [filtroCancha, setFiltroCancha] = useState<number | 'todas'>('todas');
  const [cliente, setCliente] = useState('');
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes' | 'todas'>('dia');
  const [orderBy, setOrderBy] = useState<OrderBy>('fecha');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Calcular fechas según el período seleccionado
  const calcularFechas = (periodo: 'dia' | 'semana' | 'mes' | 'todas') => {
    const hoy = new Date();
    let fechaDesde = '';
    let fechaHasta = '';

    if (periodo === 'dia') {
      fechaDesde = hoy.toISOString().split('T')[0];
      fechaHasta = hoy.toISOString().split('T')[0];
    } else if (periodo === 'semana') {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      fechaDesde = inicioSemana.toISOString().split('T')[0];
      fechaHasta = finSemana.toISOString().split('T')[0];
    } else if (periodo === 'mes') {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      fechaDesde = inicioMes.toISOString().split('T')[0];
      fechaHasta = finMes.toISOString().split('T')[0];
    }

    return { fechaDesde, fechaHasta };
  };

  useEffect(() => {
    fetchCanchas();
  }, [fetchCanchas]);

  useEffect(() => {
    const { fechaDesde, fechaHasta } = calcularFechas(periodo);
    
    const filters: ReservaFilters = {
      estado: filtro,
      cliente: cliente || undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      canchaId: filtroCancha !== 'todas' ? filtroCancha : canchaId,
      ordenarPor: orderBy,
      direccion: order,
    };
    
    if (canchaId) {
      // Si hay canchaId, mostrar reservas de esa cancha específica
      fetchReservas(canchaId, filters);
    } else {
      // Si no hay canchaId, mostrar todas las reservas del administrador
      fetchReservasAdministrador(filters);
    }
    
    // Resetear a la primera página cuando cambien los filtros
    setPage(1);
  }, [canchaId, filtro, filtroCancha, cliente, periodo, orderBy, order, fetchReservas, fetchReservasAdministrador]);

  const handleEstadoChange = (event: SelectChangeEvent) => {
    setFiltro(event.target.value as 'todas' | EstadoReserva);
  };

  const handleCanchaChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setFiltroCancha(value === 'todas' ? 'todas' : Number(value));
  };

  const handlePeriodoChange = (event: SelectChangeEvent) => {
    setPeriodo(event.target.value as 'dia' | 'semana' | 'mes' | 'todas');
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

  const handleConfirmarTodas = async () => {
    try {
      await confirmarTodasReservas();
    } catch (err) {
      // Error ya manejado en el store
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente').length;

  // Calcular reservas paginadas
  const reservasPaginadas = reservas.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(reservas.length / rowsPerPage);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {canchaId ? 'Reservas de la cancha' : 'Todas las reservas'}
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
            {!canchaId && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Cancha</InputLabel>
                  <Select value={filtroCancha.toString()} label="Cancha" onChange={handleCanchaChange}>
                    <MenuItem value="todas">Todas las canchas</MenuItem>
                    {canchas.map((cancha) => (
                      <MenuItem key={cancha.id} value={cancha.id.toString()}>
                        {cancha.nombre} ({deporteLabels[cancha.tipo] || cancha.tipo})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
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
              <FormControl fullWidth>
                <InputLabel>Período</InputLabel>
                <Select value={periodo} label="Período" onChange={handlePeriodoChange}>
                  <MenuItem value="todas">Todas las fechas</MenuItem>
                  <MenuItem value="dia">Hoy</MenuItem>
                  <MenuItem value="semana">Esta semana</MenuItem>
                  <MenuItem value="mes">Este mes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Total: {reservas.length} reservas</Typography>
            {reservasPendientes > 0 && (
              <Button
                variant="contained"
                color="success"
                startIcon={<Check />}
                onClick={handleConfirmarTodas}
                disabled={loading}
              >
                Confirmar todas ({reservasPendientes})
              </Button>
            )}
          </Box>
          
          {loading ? (
            <Typography>Cargando reservas...</Typography>
          ) : error ? (
            <Alert severity="warning">{error}</Alert>
          ) : reservas.length === 0 ? (
            <Alert severity="info">No hay reservas para el filtro seleccionado.</Alert>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cancha</TableCell>
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
                  {reservasPaginadas.map((reserva) => (
                    <TableRow key={reserva.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {reserva.canchaNombre || `Cancha ${reserva.canchaId}`}
                          </Typography>
                          {reserva.canchaDeporte && (
                            <Typography variant="caption" color="text.secondary">
                              {deporteLabels[reserva.canchaDeporte] || reserva.canchaDeporte}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{reserva.cliente}</TableCell>
                      <TableCell>{formatearFecha(reserva.fecha)}</TableCell>
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
              
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReservasTable;
