import { useEffect, useState } from 'react';
import { Box, Button, Paper, TextField, Typography, Alert, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authService } from '../services/authService';
import logoUrl from '../assets/play_match_logo.svg';
import { useAuthStore } from '../store/useAuthStore';

const schema = yup.object({
  nombre: yup.string().required('Nombre requerido'),
  telefono: yup.string().required('Teléfono requerido'),
  email: yup.string().email('Email inválido').required('Email requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña requerida'),
  role: yup.mixed<'JUGADOR' | 'DUENO'>().oneOf(['JUGADOR', 'DUENO']).required(),
});

type FormData = yup.InferType<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const { token, init } = useAuthStore((s) => ({ token: s.token, init: s.init }));
  const { register, handleSubmit, formState } = useForm<FormData>({
    defaultValues: { nombre: '', telefono: '', email: '', password: '', role: 'DUENO' },
    resolver: yupResolver(schema),
  });
  const { errors, isSubmitting } = formState;
  const [error, setError] = useState<string | undefined>();

  useEffect(() => { if (token) navigate('/dashboard', { replace: true }); }, [token, navigate]);

  const onSubmit = async (data: FormData) => {
    setError(undefined);
    try {
      const res = await authService.register(data);
      try {
        localStorage.setItem('pm_token', res.token);
        localStorage.setItem('pm_role', res.role);
      } catch {}
      init();
      navigate('/dashboard', { replace: true });
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || 'No se pudo registrar');
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" px={2} sx={{ backgroundColor: '#208f4b' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 520 }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <img src={logoUrl} alt="PlayMatch" style={{ height: 64 }} />
        </Box>
        <Typography variant="h5" gutterBottom>
          Crear cuenta
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField label="Nombre" fullWidth margin="normal" {...register('nombre')} error={Boolean(errors.nombre)} helperText={errors.nombre?.message} />
          <TextField label="Teléfono" fullWidth margin="normal" {...register('telefono')} error={Boolean(errors.telefono)} helperText={errors.telefono?.message} />
          <TextField label="Email" fullWidth margin="normal" {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} />
          <TextField label="Contraseña" type="password" fullWidth margin="normal" {...register('password')} error={Boolean(errors.password)} helperText={errors.password?.message} />
          <TextField select label="Rol" fullWidth margin="normal" defaultValue={'DUENO'} {...register('role')} error={Boolean(errors.role)}>
            <MenuItem value="DUENO">Dueño</MenuItem>
            <MenuItem value="JUGADOR">Jugador</MenuItem>
          </TextField>
          {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear cuenta'}
          </Button>
          <Button component={RouterLink} to="/login" fullWidth sx={{ mt: 1 }}>
            ¿Ya tenés cuenta? Iniciar sesión
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
