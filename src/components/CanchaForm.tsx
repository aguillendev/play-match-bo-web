import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCanchaStore } from '../store/useCanchaStore';
import { CanchaTipo } from '../types';

const schema = yup.object({
  nombre: yup.string().required('Ingresa el nombre de la cancha'),
  direccion: yup.string().required('Ingresa la dirección'),
  tipo: yup.mixed<CanchaTipo>().oneOf(['Fútbol 5', 'Fútbol 7', 'Fútbol 11', 'Pádel', 'Básquet']).required(),
  valorHora: yup
    .number()
    .typeError('Ingresa un valor numérico')
    .positive('Debe ser mayor a 0')
    .required('Ingresa el valor por hora'),
});

type FormData = yup.InferType<typeof schema>;

async function obtenerUbicacion(): Promise<{ latitud: number; longitud: number } | undefined> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return undefined;
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
        });
      },
      () => resolve(undefined),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  });
}

const tipos: CanchaTipo[] = ['Fútbol 5', 'Fútbol 7', 'Fútbol 11', 'Pádel', 'Básquet'];

const CanchaForm = () => {
  const { register, handleSubmit, formState, reset } = useForm<FormData>({
    defaultValues: { nombre: '', direccion: '', tipo: 'Fútbol 5', valorHora: 150 },
    resolver: yupResolver(schema),
  });
  const { errors, isSubmitting } = formState;
  const { canchas, fetchCanchas, addCancha } = useCanchaStore((state) => ({
    canchas: state.canchas,
    fetchCanchas: state.fetchCanchas,
    addCancha: state.addCancha,
  }));
  const [alerta, setAlerta] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!canchas.length) {
      fetchCanchas();
    }
  }, [canchas.length, fetchCanchas]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      setError(undefined);
      try {
        const ubicacion = await obtenerUbicacion();
        const nueva = await addCancha({
          ...data,
          latitud: ubicacion?.latitud,
          longitud: ubicacion?.longitud,
        });
        if (nueva) {
          reset();
          setAlerta(`Cancha "${nueva.nombre}" registrada correctamente.`);
        }
      } catch (e) {
        console.error(e);
        setError('Ocurrió un error al registrar la cancha');
      }
    },
    [addCancha, reset],
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Registrar nueva cancha
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre"
                fullWidth
                {...register('nombre')}
                error={Boolean(errors.nombre)}
                helperText={errors.nombre?.message}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Dirección"
                fullWidth
                {...register('direccion')}
                error={Boolean(errors.direccion)}
                helperText={errors.direccion?.message}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select label="Tipo de cancha" fullWidth {...register('tipo')} error={Boolean(errors.tipo)}>
                {tipos.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Valor por hora (Bs.)"
                type="number"
                fullWidth
                {...register('valorHora')}
                error={Boolean(errors.valorHora)}
                helperText={errors.valorHora?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Al guardar intentaremos obtener tu ubicación actual para asociarla a la cancha.
              </Alert>
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={() => reset()} disabled={isSubmitting}>
                  Limpiar
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Registrar cancha'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar
        open={Boolean(alerta)}
        autoHideDuration={4000}
        onClose={() => setAlerta(undefined)}
        message={alerta}
      />
    </Box>
  );
};

export default CanchaForm;
