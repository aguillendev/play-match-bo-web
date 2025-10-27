import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useCanchaStore } from '../store/useCanchaStore';
import { HorarioDisponible } from '../types';

interface HorariosManagerProps {
  canchaId: string;
}

const diasOrdenados = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const HorariosManager = ({ canchaId }: HorariosManagerProps) => {
  const { canchas, fetchCanchas, updateHorarios, loading } = useCanchaStore((state) => ({
    canchas: state.canchas,
    fetchCanchas: state.fetchCanchas,
    updateHorarios: state.updateHorarios,
    loading: state.loading,
  }));
  const [localHorarios, setLocalHorarios] = useState<Record<string, HorarioDisponible>>({});
  const [mensaje, setMensaje] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const cancha = useMemo(() => canchas.find((c) => c.id === canchaId), [canchas, canchaId]);

  useEffect(() => {
    if (!canchas.length) {
      fetchCanchas();
    }
  }, [canchas.length, fetchCanchas]);

  useEffect(() => {
    if (cancha) {
      const mapping: Record<string, HorarioDisponible> = {};
      diasOrdenados.forEach((dia) => {
        const existente = cancha.horarios.find((h) => h.dia === dia);
        mapping[dia] =
          existente ?? {
            dia,
            apertura: '08:00',
            cierre: '22:00',
          };
      });
      setLocalHorarios(mapping);
    }
  }, [cancha]);

  const handleChange = (dia: string, campo: 'apertura' | 'cierre', valor: string) => {
    setLocalHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor,
      },
    }));
  };

  const handleGuardar = async () => {
    if (!cancha) return;
    setMensaje(undefined);
    setError(undefined);
    try {
      await updateHorarios(
        cancha.id,
        diasOrdenados.map((dia) => localHorarios[dia]),
      );
      setMensaje('Horarios actualizados correctamente.');
    } catch (e) {
      console.error(e);
      setError('No se pudieron actualizar los horarios');
    }
  };

  if (!cancha) {
    return <Alert severity="warning">Selecciona o registra una cancha para gestionar sus horarios.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Horarios disponibles – {cancha.nombre}
      </Typography>
      <Grid container spacing={2}>
        {diasOrdenados.map((dia) => (
          <Grid item xs={12} md={6} key={dia}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {dia}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Apertura"
                      type="time"
                      value={localHorarios[dia]?.apertura ?? '08:00'}
                      onChange={(event) => handleChange(dia, 'apertura', event.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Cierre"
                      type="time"
                      value={localHorarios[dia]?.cierre ?? '22:00'}
                      onChange={(event) => handleChange(dia, 'cierre', event.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button variant="contained" onClick={handleGuardar} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </Box>
      {mensaje && (
        <Box mt={2}>
          <Alert severity="success">{mensaje}</Alert>
        </Box>
      )}
      {error && (
        <Box mt={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default HorariosManager;
