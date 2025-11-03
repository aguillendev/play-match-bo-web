import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useCanchaStore } from '../store/useCanchaStore';
import { HorarioIntervalo } from '../types';

interface HorariosManagerProps {
  canchaId: number;
}

const HorariosManager = ({ canchaId }: HorariosManagerProps) => {
  const { canchas, fetchCanchas, updateHorarios, loading } = useCanchaStore((state) => ({
    canchas: state.canchas,
    fetchCanchas: state.fetchCanchas,
    updateHorarios: state.updateHorarios,
    loading: state.loading,
  }));
  const cancha = useMemo(() => canchas.find((c) => c.id === canchaId), [canchas, canchaId]);
  const [intervalos, setIntervalos] = useState<HorarioIntervalo[]>([]);
  const [mensaje, setMensaje] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [copiarDesdeId, setCopiarDesdeId] = useState<number | ''>('');

  useEffect(() => {
    if (!canchas.length) {
      fetchCanchas();
    }
  }, [canchas.length, fetchCanchas]);

  useEffect(() => {
    if (cancha) {
      setIntervalos(cancha.horarios?.length ? cancha.horarios : [{ inicio: '09:00', fin: '12:00' }, { inicio: '16:00', fin: '23:00' }]);
    }
  }, [cancha]);

  const actualizar = async () => {
    if (!cancha) return;
    setMensaje(undefined);
    setError(undefined);
    try {
      // Validación simple: inicio < fin
      const invalido = intervalos.some((i) => !i.inicio || !i.fin || i.inicio >= i.fin);
      if (invalido) {
        setError('Revisá que cada intervalo tenga inicio anterior al fin');
        return;
      }
      const merged: HorarioIntervalo[] = intervalos.map((i) => ({ inicio: normalizar(i.inicio), fin: normalizar(i.fin) }));
      await updateHorarios(cancha.id, merged);
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
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="subtitle1">Duplicar horarios desde:</Typography>
            <Select size="small" value={copiarDesdeId} onChange={(e) => setCopiarDesdeId(Number(e.target.value))} displayEmpty sx={{ minWidth: 220 }}>
              <MenuItem value="">
                <em>Seleccionar</em>
              </MenuItem>
              {canchas.filter((c) => c.id !== canchaId).map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </Select>
            <Button onClick={() => {
              const src = canchas.find((c) => c.id === copiarDesdeId);
              if (src && src.horarios) {
                const sorted = [...src.horarios].sort((a,b) => a.inicio.localeCompare(b.inicio));
                setIntervalos(sorted);
              }
            }} disabled={!copiarDesdeId}>Copiar</Button>
          </Box>
          <Grid container spacing={2} alignItems="center">
            {intervalos.map((it, idx) => (
              <>
                <Grid key={`inicio-${idx}`} item xs={5} md={3}>
                  <TextField label="Inicio" type="time" fullWidth value={it.inicio} onChange={(e) => onChange(idx, 'inicio', e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid key={`fin-${idx}`} item xs={5} md={3}>
                  <TextField label="Fin" type="time" fullWidth value={it.fin} onChange={(e) => onChange(idx, 'fin', e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid key={`del-${idx}`} item xs={2} md={1}>
                  <IconButton color="error" onClick={() => remove(idx)} aria-label="Eliminar">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </>
            ))}
            <Grid item xs={12}>
              <Button startIcon={<AddIcon />} onClick={add}>
                Agregar intervalo
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button variant="contained" onClick={actualizar} disabled={loading}>
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

  function onChange(idx: number, campo: keyof HorarioIntervalo, valor: string) {
    setIntervalos((prev) => prev.map((i, j) => (j === idx ? { ...i, [campo]: valor } : i)));
  }
  function add() {
    setIntervalos((prev) => [...prev, { inicio: '09:00', fin: '12:00' }]);
  }
  function remove(idx: number) {
    setIntervalos((prev) => prev.filter((_, j) => j !== idx));
  }
  function normalizar(t: string) {
    return t.length === 5 ? `${t}:00` : t;
  }
};

export default HorariosManager;
