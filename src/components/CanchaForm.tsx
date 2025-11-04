import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { SportsSoccer, SportsTennis, SportsBasketball, SportsEsports } from '@mui/icons-material';
import HorariosManager from './HorariosManager';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCanchaStore } from '../store/useCanchaStore';
import { Deporte } from '../types';

const TIPOS: Deporte[] = ['FUTBOL', 'PADEL', 'TENIS', 'BASQUET', 'OTRO'];

const getDeporteIcon = (tipo: Deporte) => {
  const iconProps = { sx: { fontSize: 40, color: 'primary.main' } };
  switch (tipo) {
    case 'FUTBOL':
      return <SportsSoccer {...iconProps} />;
    case 'PADEL':
      return <SportsTennis {...iconProps} />;
    case 'TENIS':
      return <SportsTennis {...iconProps} />;
    case 'BASQUET':
      return <SportsBasketball {...iconProps} />;
    case 'OTRO':
    default:
      return <SportsEsports {...iconProps} />;
  }
};

const schema = yup.object({
  nombre: yup.string().required('Ingresa el nombre de la cancha'),
  direccion: yup.string().required('Ingresa la dirección'),
  tipo: yup.mixed<Deporte>().oneOf(TIPOS).required('Selecciona el tipo'),
  precioHora: yup
    .number()
    .typeError('Ingresa un valor numérico')
    .positive('Debe ser mayor a 0')
    .required('Ingresa el valor por hora'),
});

type FormData = yup.InferType<typeof schema>;

async function obtenerUbicacion(): Promise<{ latitud: number; longitud: number } | undefined> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return undefined;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitud: position.coords.latitude, longitud: position.coords.longitude }),
      () => resolve(undefined),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  });
}

const CanchaForm = () => {
  const { register, control, handleSubmit, formState, reset } = useForm<FormData>({
    defaultValues: { nombre: '', direccion: '', tipo: undefined, precioHora: undefined },
    resolver: yupResolver(schema),
  });
  const { errors, isSubmitting } = formState;
  const { canchas, fetchCanchas, addCancha, updateCancha, deleteCancha } = useCanchaStore((state) => ({
    canchas: state.canchas,
    fetchCanchas: state.fetchCanchas,
    addCancha: state.addCancha,
    updateCancha: state.updateCancha,
    deleteCancha: state.deleteCancha,
  }));
  const [alerta, setAlerta] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [horariosOpenFor, setHorariosOpenFor] = useState<number | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!canchas.length) fetchCanchas();
  }, [canchas.length, fetchCanchas]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      setError(undefined);
      try {
        const ubicacion = await obtenerUbicacion();
        if (editingId) {
          const actualizada = await updateCancha(editingId, { ...data, latitud: ubicacion?.latitud, longitud: ubicacion?.longitud, horarios: [] } as any);
          if (actualizada) {
            reset({ nombre: '', direccion: '', tipo: undefined, precioHora: undefined });
            setEditingId(undefined);
            setFormOpen(false);
            setAlerta(`Cancha "${actualizada.nombre}" actualizada.`);
          }
        } else {
          const nueva = await addCancha({ ...data, latitud: ubicacion?.latitud, longitud: ubicacion?.longitud, horarios: [] } as any);
          if (nueva) {
            reset({ nombre: '', direccion: '', tipo: undefined, precioHora: undefined });
            setFormOpen(false);
            setAlerta(`Cancha "${nueva.nombre}" registrada correctamente.`);
          }
        }
      } catch (e) {
        console.error(e);
        setError('Ocurrió un error al registrar la cancha');
      }
    },
    [addCancha, updateCancha, editingId, reset],
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Canchas</Typography>
        <Button variant="contained" onClick={() => { setEditingId(undefined); reset({ nombre: '', direccion: '', tipo: undefined, precioHora: undefined }); setFormOpen(true); }}>
          Nueva cancha
        </Button>
      </Box>
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Canchas registradas
        </Typography>
        <Grid container spacing={2}>
          {canchas.map((c) => (
            <Grid item xs={12} md={6} key={c.id}>
              <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box display="flex" alignItems="center" gap={2} sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getDeporteIcon(c.tipo as Deporte)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">{c.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.direccion} • {c.tipo} • ${c.precioHora}
                    </Typography>
                    {c.horarios && c.horarios.length > 0 && (
                      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                        {c.horarios.map((h, idx) => (
                          <Chip key={idx} size="small" label={`${h.inicio.slice(0,5)}–${h.fin.slice(0,5)}`} />
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Box>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingId(c.id);
                      reset({ nombre: c.nombre, direccion: c.direccion, tipo: c.tipo as any, precioHora: c.precioHora });
                      setFormOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button variant="outlined" onClick={() => setHorariosOpenFor(c.id)}>
                    Gestionar horarios
                  </Button>
                  <Button color="error" variant="outlined" onClick={() => deleteCancha(c.id)} disabled={c.tieneReservasFuturas} title={c.tieneReservasFuturas ? 'No se puede eliminar: tiene reservas futuras' : undefined}>
                    Eliminar
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Dialogo de crear/editar */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar cancha' : 'Registrar nueva cancha'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Nombre" fullWidth InputLabelProps={{ shrink: true }} {...register('nombre')} error={Boolean(errors.nombre)} helperText={errors.nombre?.message} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Dirección" fullWidth InputLabelProps={{ shrink: true }} {...register('direccion')} error={Boolean(errors.direccion)} helperText={errors.direccion?.message} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  control={control}
                  name="tipo"
                  render={({ field }) => (
                    <TextField select label="Tipo de cancha" fullWidth InputLabelProps={{ shrink: true }} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} error={Boolean(errors.tipo)} helperText={(errors as any).tipo?.message as string | undefined}>
                      {TIPOS.map((tipo) => (
                        <MenuItem key={tipo} value={tipo}>
                          {tipo}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Valor por hora" type="number" fullWidth InputLabelProps={{ shrink: true }} {...register('precioHora')} error={Boolean(errors.precioHora)} helperText={errors.precioHora?.message} />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">Al guardar intentaremos obtener tu ubicación actual para asociarla a la cancha.</Alert>
              </Grid>
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
            </Grid>
            <DialogActions sx={{ pr: 0 }}>
              <Button onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Registrar cancha'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(horariosOpenFor)} onClose={() => setHorariosOpenFor(undefined)} maxWidth="md" fullWidth>
        <DialogTitle>Disponibilidad de la cancha</DialogTitle>
        <DialogContent>
          {horariosOpenFor && <HorariosManager canchaId={horariosOpenFor} />}
        </DialogContent>
      </Dialog>
      <Snackbar open={Boolean(alerta)} autoHideDuration={4000} onClose={() => setAlerta(undefined)} message={alerta} />
    </Box>
  );
};

export default CanchaForm;
