import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from '@mui/material';
import { useCanchaStore } from '../store/useCanchaStore';
import { useReservaStore } from '../store/useReservaStore';
import { Reserva } from '../types';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Formatea una fecha local a YYYY-MM-DD (evita desfases por zona horaria)
const toLocalDateStr = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const deporteLabels: Record<string, string> = {
  FUTBOL: 'Fútbol',
  PADEL: 'Pádel',
  TENIS: 'Tenis',
  BASQUET: 'Básquet',
  OTRO: 'Otro',
};

const CalendarioReservas = () => {
  const { canchas, fetchCanchas, loading: loadingCanchas } = useCanchaStore((state) => ({
    canchas: state.canchas,
    fetchCanchas: state.fetchCanchas,
    loading: state.loading,
  }));

  const { reservas, fetchReservasAdministrador, loading: loadingReservas } = useReservaStore((state) => ({
    reservas: state.reservas,
    fetchReservasAdministrador: state.fetchReservasAdministrador,
    loading: state.loading,
  }));

  const [canchaSeleccionada, setCanchaSeleccionada] = useState<number | null>(null);
  const [semanaOffset, setSemanaOffset] = useState(0); // 0 = semana actual, 1 = siguiente, -1 = anterior
  const [vistaCalendario, setVistaCalendario] = useState<'dia' | 'semana'>('dia'); // Vista por día por defecto

  useEffect(() => {
    fetchCanchas();
  }, [fetchCanchas]);

  useEffect(() => {
    // Seleccionar la primera cancha automáticamente
    if (canchas.length > 0 && canchaSeleccionada === null) {
      setCanchaSeleccionada(canchas[0].id!);
    }
  }, [canchas, canchaSeleccionada]);

  useEffect(() => {
    // Calcular fechas según la vista
    let fechaDesde: string;
    let fechaHasta: string;
    
    if (vistaCalendario === 'dia') {
      const hoy = new Date();
      hoy.setDate(hoy.getDate() + semanaOffset);
      fechaDesde = toLocalDateStr(hoy);
      fechaHasta = toLocalDateStr(hoy);
    } else {
      const dias = calcularSemana(semanaOffset);
      fechaDesde = toLocalDateStr(dias[0]);
      fechaHasta = toLocalDateStr(dias[6]);
    }

    // Cargar reservas del período
    fetchReservasAdministrador({
      estado: 'todas',
      fechaDesde,
      fechaHasta,
      canchaId: canchaSeleccionada || undefined,
    });
  }, [fetchReservasAdministrador, semanaOffset, canchaSeleccionada, vistaCalendario]);

  const handleCanchaChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setCanchaSeleccionada(Number(value));
  };

  const handleVistaChange = (_: unknown, nuevaVista: 'dia' | 'semana' | null) => {
    if (nuevaVista) {
      setVistaCalendario(nuevaVista);
      setSemanaOffset(0); // Resetear al día/semana actual
    }
  };

  // Calcular fechas de la semana (de lunes a domingo)
  const calcularSemana = (offset: number) => {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    const primerDia = new Date(hoy);
    
    // Calcular el lunes de la semana actual
    // Si es domingo (0), retroceder 6 días; si es lunes (1), no retroceder; si es martes (2), retroceder 1 día, etc.
    const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1;
    primerDia.setDate(hoy.getDate() - diasDesdeInicio + offset * 7);
    
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(primerDia);
      dia.setDate(primerDia.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  const diasDeSemana = calcularSemana(semanaOffset);

  // Generar horarios (6:00 AM a 11:00 PM, cada hora)
  const generarHorarios = () => {
    const horarios = [];
    for (let h = 6; h <= 23; h++) {
      horarios.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return horarios;
  };

  const horarios = generarHorarios();

  // Obtener la cancha seleccionada
  const canchaActual = canchas.find(c => c.id === canchaSeleccionada);

  // Obtener información de la reserva para un slot específico
  // Devuelve: la reserva y el porcentaje de ocupación del slot (50% si es media hora, 100% si es hora completa)
  const obtenerInfoReserva = (fecha: Date, hora: string, canchaId: number): { reserva: Reserva | undefined, porcentaje: number, esInicio: boolean } => {
    const fechaStr = toLocalDateStr(fecha);
    
    // Buscar reserva que abarque este slot de tiempo
    const reserva = reservas.find(r => {
      const coincideCanchaId = r.canchaId === canchaId;
      const coincideFecha = r.fecha === fechaStr;
      const noCancelada = r.estado !== 'cancelada';
      
      if (!coincideCanchaId || !coincideFecha || !noCancelada) {
        return false;
      }
      
      // Convertir horas a minutos para comparar rangos
      const [horaSlotH] = hora.split(':').map(Number);
      const slotInicioMinutos = horaSlotH * 60;
      const slotFinMinutos = slotInicioMinutos + 60; // Cada slot es de 1 hora
      
      const [horaInicioH, horaInicioM] = r.horaInicio.split(':').map(Number);
      const inicioMinutos = horaInicioH * 60 + horaInicioM;
      
      const [horaFinH, horaFinM] = r.horaFin.split(':').map(Number);
      const finMinutos = horaFinH * 60 + horaFinM;
      
      // El slot está ocupado si hay alguna intersección
      const hayInterseccion = inicioMinutos < slotFinMinutos && finMinutos > slotInicioMinutos;
      
      return hayInterseccion;
    });
    
    if (!reserva) {
      return { reserva: undefined, porcentaje: 0, esInicio: false };
    }
    
    // Calcular el porcentaje de ocupación del slot
    const [horaSlotH] = hora.split(':').map(Number);
    const slotInicioMinutos = horaSlotH * 60;
    const slotFinMinutos = slotInicioMinutos + 60;
    
    const [horaInicioH, horaInicioM] = reserva.horaInicio.split(':').map(Number);
    const inicioMinutos = horaInicioH * 60 + horaInicioM;
    
    const [horaFinH, horaFinM] = reserva.horaFin.split(':').map(Number);
    const finMinutos = horaFinH * 60 + horaFinM;
    
    // Calcular la intersección
    const inicioInterseccion = Math.max(slotInicioMinutos, inicioMinutos);
    const finInterseccion = Math.min(slotFinMinutos, finMinutos);
    const minutosOcupados = finInterseccion - inicioInterseccion;
    
    const porcentaje = (minutosOcupados / 60) * 100;
    const esInicio = reserva.horaInicio.substring(0, 5) === hora.substring(0, 5) || 
                     (inicioMinutos >= slotInicioMinutos && inicioMinutos < slotFinMinutos);
    
    return { reserva, porcentaje, esInicio };
  };

  // Determinar si un horario está disponible (según horarios de la cancha)
  const esHorarioDisponible = (cancha: any, hora: string): boolean => {
    // Si no hay horarios configurados, mostrar todo como disponible
    if (!cancha.horarios || cancha.horarios.length === 0) {
      return true;
    }

    const [hs, ms] = hora.split(':').map((n: string) => parseInt(n, 10));
    const slotInicio = (isNaN(hs) ? 0 : hs) * 60 + (isNaN(ms) ? 0 : ms);

    // Disponible si el inicio del slot cae dentro de algún intervalo (inicio/fin)
    return cancha.horarios.some((h: any) => {
      const [hiH, hiM] = String(h.inicio ?? h.horaInicio ?? '00:00').split(':').map((n: string) => parseInt(n, 10));
      const [hfH, hfM] = String(h.fin ?? h.horaFin ?? '00:00').split(':').map((n: string) => parseInt(n, 10));
      const inicio = (isNaN(hiH) ? 0 : hiH) * 60 + (isNaN(hiM) ? 0 : hiM);
      const fin = (isNaN(hfH) ? 0 : hfH) * 60 + (isNaN(hfM) ? 0 : hfM);
      return slotInicio >= inicio && slotInicio < fin;
    });
  };

  const renderCelda = (fecha: Date, hora: string, canchaId: number, cancha: any) => {
    const fechaStr = toLocalDateStr(fecha);
    const { reserva, porcentaje, esInicio } = obtenerInfoReserva(fecha, hora, canchaId);
    // Convertir getDay() (0=Domingo, 6=Sábado) a formato BD (1=Lunes, 7=Domingo)
    const diaSemanaJS = fecha.getDay(); // 0-6
    const diaSemana = diaSemanaJS === 0 ? 7 : diaSemanaJS; // Convertir: 0→7, 1→1, 2→2, ..., 6→6
    const disponible = esHorarioDisponible(cancha, hora);

    if (!disponible) {
      return (
        <Box
          sx={{
            height: 50,
            border: '1px solid #e5e7eb',
            borderTop: 'none',
            borderLeft: 'none',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="#94a3b8" fontSize="0.65rem">
            -
          </Typography>
        </Box>
      );
    }

    if (reserva) {
      const color = reserva.estado === 'confirmada' 
        ? '#208f4b' 
        : reserva.estado === 'pendiente' 
        ? '#ff9800' 
        : '#9e9e9e';
      
      const bgColor = reserva.estado === 'confirmada'
        ? 'rgba(32, 143, 75, 0.1)'
        : reserva.estado === 'pendiente'
        ? '#fff7ed'
        : '#f5f5f5';

      // Si el porcentaje es menor a 100%, crear un gradiente
      const backgroundStyle = porcentaje < 100 
        ? `linear-gradient(to bottom, ${bgColor} 0%, ${bgColor} ${porcentaje}%, white ${porcentaje}%, white 100%)`
        : bgColor;

      return (
        <Tooltip 
          title={
            <Box>
              <Typography variant="body2">{reserva.cliente}</Typography>
              <Typography variant="caption">Horario: {reserva.horaInicio.substring(0, 5)} - {reserva.horaFin.substring(0, 5)}</Typography>
              <Typography variant="caption" display="block">Estado: {reserva.estado}</Typography>
              <Typography variant="caption" display="block">
                ${reserva.monto}
              </Typography>
            </Box>
          }
        >
          <Box
            sx={{
              height: 50,
              background: backgroundStyle,
              border: '1px solid #e5e7eb',
              borderTop: 'none',
              borderLeft: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: `0 2px 8px ${color}40`,
                transform: 'scale(1.02)',
                zIndex: 10,
                borderColor: color,
              },
            }}
          >
            {esInicio && (
              <>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', color: reserva.estado === 'confirmada' ? '#208f4b' : '#1e293b' }}>
                  {reserva.cliente?.split(' ')[0]}
                </Typography>
                <Chip
                  label={reserva.estado === 'confirmada' ? 'Conf.' : 'Pend.'}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    backgroundColor: color,
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-label': {
                      px: 1,
                    }
                  }}
                />
              </>
            )}
            {!esInicio && porcentaje === 100 && (
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                ↓
              </Typography>
            )}
          </Box>
        </Tooltip>
      );
    }

    return (
      <Box
        sx={{
          height: 50,
          border: '1px solid #e5e7eb',
          borderTop: 'none',
          borderLeft: 'none',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: '#f0f9ff',
            borderColor: 'primary.light',
            cursor: 'pointer',
          },
        }}
      >
        <Typography variant="caption" color="#94a3b8" fontSize="0.7rem" fontWeight={500}>
          Libre
        </Typography>
      </Box>
    );
  };

  const formatearFecha = (fecha: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaComp = new Date(fecha);
    fechaComp.setHours(0, 0, 0, 0);

    if (fechaComp.getTime() === hoy.getTime()) {
      return 'Hoy';
    }

    return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
  };

  // Obtener nombre del día de la semana (ajustado para array que empieza en Lunes)
  const getNombreDia = (fecha: Date) => {
    const dia = fecha.getDay();
    // Convertir: domingo (0) -> índice 6, lunes (1) -> índice 0, ..., sábado (6) -> índice 5
    const indice = dia === 0 ? 6 : dia - 1;
    return diasSemana[indice];
  };

  if (loadingCanchas || loadingReservas) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (canchas.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Calendario de Reservas
        </Typography>
        <Alert severity="info">
          No tienes canchas registradas. Crea tu primera cancha para ver el calendario.
        </Alert>
      </Box>
    );
  }

  if (!canchaActual) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom fontWeight={600} color="#1e293b">
          Calendario de Reservas
        </Typography>
        
        {/* Toggle para cambiar entre vista día y semana */}
        <ToggleButtonGroup
          color="primary"
          value={vistaCalendario}
          exclusive
          onChange={handleVistaChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.5,
              fontWeight: 500,
              fontSize: '0.875rem',
              borderColor: '#208f4b',
              color: '#208f4b',
              textTransform: 'none',
              '&.Mui-selected': {
                backgroundColor: '#208f4b',
                color: 'white',
                borderColor: '#208f4b',
                '&:hover': {
                  backgroundColor: '#1a7a3f',
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(32, 143, 75, 0.08)',
              }
            }
          }}
        >
          <ToggleButton value="dia">
            <CalendarTodayIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Día
          </ToggleButton>
          <ToggleButton value="semana">
            <DateRangeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Semana
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ '&.Mui-focused': { color: '#208f4b' } }}>Cancha</InputLabel>
            <Select 
              value={canchaSeleccionada?.toString() || ''} 
              label="Cancha" 
              onChange={handleCanchaChange}
              sx={{
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#208f4b',
                }
              }}
            >
              {canchas.map((cancha) => (
                <MenuItem key={cancha.id} value={cancha.id!.toString()}>
                  {cancha.nombre} ({deporteLabels[cancha.tipo] || cancha.tipo})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box display="flex" gap={1} alignItems="center" height="100%">
            <IconButton
              onClick={() => setSemanaOffset(semanaOffset - 1)}
              size="small"
              sx={{
                backgroundColor: 'rgba(32, 143, 75, 0.08)',
                border: '1px solid #208f4b',
                color: '#208f4b',
                '&:hover': {
                  backgroundColor: '#208f4b',
                  color: 'white',
                },
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: '120px', textAlign: 'center', fontWeight: 500, color: '#475569' }}>
              {vistaCalendario === 'dia' 
                ? (semanaOffset === 0 ? 'Hoy' : `${semanaOffset > 0 ? '+' : ''}${semanaOffset} ${Math.abs(semanaOffset) === 1 ? 'día' : 'días'}`)
                : (semanaOffset === 0 ? 'Esta semana' : `${semanaOffset > 0 ? '+' : ''}${semanaOffset} ${Math.abs(semanaOffset) === 1 ? 'semana' : 'semanas'}`)
              }
            </Typography>
            <IconButton
              onClick={() => setSemanaOffset(semanaOffset + 1)}
              size="small"
              sx={{
                backgroundColor: 'rgba(32, 143, 75, 0.08)',
                border: '1px solid #208f4b',
                color: '#208f4b',
                '&:hover': {
                  backgroundColor: '#208f4b',
                  color: 'white',
                },
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      <Card 
        sx={{ 
          mb: 3,
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              pb: 2,
              mb: 3,
              borderBottom: '2px solid #208f4b',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 40,
                backgroundColor: '#208f4b',
                borderRadius: 1,
              }}
            />
            <Box>
              <Typography variant="h6" fontWeight={700} fontSize="1.25rem" color="#1e293b">
                {canchaActual.nombre}
              </Typography>
              <Typography variant="body2" color="#64748b" fontSize="0.875rem">
                {deporteLabels[canchaActual.tipo] || canchaActual.tipo}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: vistaCalendario === 'dia' ? '600px' : '900px' }}>
              {/* Encabezado con días */}
              <Grid container>
                  <Grid item xs={vistaCalendario === 'dia' ? 2 : 1}>
                    <Box
                      sx={{
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(32, 143, 75, 0.08) 0%, rgba(32, 143, 75, 0.12) 100%)',
                        fontWeight: 600,
                        border: '1px solid rgba(32, 143, 75, 0.2)',
                        borderTopLeftRadius: 8,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} color="#208f4b" fontSize="0.8rem">
                        Horario
                      </Typography>
                    </Box>
                  </Grid>
                  {vistaCalendario === 'semana' ? (
                    diasDeSemana.map((dia, index) => (
                      <Grid item xs key={index}>
                        <Box
                          sx={{
                            height: 50,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, rgba(32, 143, 75, 0.08) 0%, rgba(32, 143, 75, 0.12) 100%)',
                            fontWeight: 600,
                            border: '1px solid rgba(32, 143, 75, 0.2)',
                            borderLeft: 'none',
                            borderTopRightRadius: index === 6 ? 8 : 0,
                          }}
                        >
                          <Typography variant="caption" fontWeight={600} color="#208f4b" fontSize="0.7rem">
                            {getNombreDia(dia)}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="#208f4b" fontSize="0.75rem">
                            {formatearFecha(dia)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={10}>
                      <Box
                        sx={{
                          height: 50,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, rgba(32, 143, 75, 0.08) 0%, rgba(32, 143, 75, 0.12) 100%)',
                          fontWeight: 600,
                          border: '1px solid rgba(32, 143, 75, 0.2)',
                          borderLeft: 'none',
                          borderTopRightRadius: 8,
                        }}
                      >
                        <Typography variant="caption" fontWeight={600} color="#208f4b" fontSize="0.7rem">
                          {getNombreDia(diasDeSemana[semanaOffset])}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="#208f4b" fontSize="0.75rem">
                          {formatearFecha(diasDeSemana[semanaOffset])}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* Filas de horarios */}
                {horarios.map((hora) => (
                  <Grid container key={hora}>
                    <Grid item xs={vistaCalendario === 'dia' ? 2 : 1}>
                      <Box
                        sx={{
                          height: 50,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e5e7eb',
                          borderTop: 'none',
                        }}
                      >
                        <Typography variant="body2" fontWeight={500} fontSize="0.8rem" color="#64748b">
                          {hora}
                        </Typography>
                      </Box>
                    </Grid>
                    {vistaCalendario === 'semana' ? (
                      diasDeSemana.map((dia, index) => (
                        <Grid item xs key={index}>
                          {renderCelda(dia, hora, canchaActual.id!, canchaActual)}
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={10}>
                        {renderCelda(diasDeSemana[semanaOffset], hora, canchaActual.id!, canchaActual)}
                      </Grid>
                    )}
                  </Grid>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>

      {/* Leyenda */}
      <Card 
        sx={{ 
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography variant="subtitle2" gutterBottom fontWeight={600} color="#208f4b" fontSize="0.8rem" textTransform="uppercase" letterSpacing="0.5px">
            Leyenda
          </Typography>
          <Box display="flex" gap={3} flexWrap="wrap" mt={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, backgroundColor: 'rgba(32, 143, 75, 0.1)', border: '2px solid #208f4b', borderRadius: 0.5 }} />
              <Typography variant="body2" fontSize="0.875rem" color="#475569">Confirmada</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, backgroundColor: '#fff7ed', border: '2px solid #ff9800', borderRadius: 0.5 }} />
              <Typography variant="body2" fontSize="0.875rem" color="#475569">Pendiente</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 0.5 }} />
              <Typography variant="body2" fontSize="0.875rem" color="#475569">Libre</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 0.5 }} />
              <Typography variant="body2" fontSize="0.875rem" color="#475569">No disponible</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CalendarioReservas;
