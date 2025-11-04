import { useEffect, useState } from 'react';
import { Box, Button, Paper, TextField, Typography, Alert } from '@mui/material';
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
});

type FormData = yup.InferType<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const { token, init } = useAuthStore((s) => ({ token: s.token, init: s.init }));
  const { register, handleSubmit, formState } = useForm<FormData>({
    defaultValues: { nombre: '', telefono: '', email: '', password: '' },
    resolver: yupResolver(schema),
  });
  const { errors, isSubmitting } = formState;
  const [error, setError] = useState<string | undefined>();

  useEffect(() => { if (token) navigate('/dashboard', { replace: true }); }, [token, navigate]);

  const onSubmit = async (data: FormData) => {
    setError(undefined);
    try {
      const res = await authService.register({ ...data, role: 'ADMINISTRADOR_CANCHA' });
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
    <Box 
      display="flex" 
      minHeight="100vh"
      sx={{
        background: '#0a0f0d',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Fondo con gradiente dinámico */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(32, 143, 75, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(38, 165, 88, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(26, 122, 62, 0.08) 0%, transparent 70%)
          `,
        }}
      />
      
      {/* Patrón de puntos moderno */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.6,
        }}
      />

      {/* Líneas diagonales sutiles */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-10%',
          width: '120%',
          height: '200%',
          background: 'repeating-linear-gradient(45deg, transparent, transparent 80px, rgba(32, 143, 75, 0.03) 80px, rgba(32, 143, 75, 0.03) 160px)',
          transform: 'rotate(-15deg)',
        }}
      />

      {/* Formas geométricas modernas */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: '2px solid rgba(32, 143, 75, 0.15)',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            border: '2px solid rgba(38, 165, 88, 0.1)',
            transform: 'translate(-50%, -50%)',
          }
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '8%',
          width: '250px',
          height: '250px',
          border: '2px solid rgba(32, 143, 75, 0.12)',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          transform: 'rotate(45deg)',
        }}
      />

      {/* Contenedor del formulario */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="100%"
        px={2}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: 5, 
            width: '100%', 
            maxWidth: 540,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          }}
        >
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <img src={logoUrl} alt="PlayMatch" style={{ height: 64, marginBottom: 16 }} />
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: 'primary.main',
            }}
          >
            PLAY MATCH
          </Typography>
        </Box>
        <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
          Crear cuenta
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField label="Nombre" fullWidth margin="normal" autoComplete="off" {...register('nombre')} error={Boolean(errors.nombre)} helperText={errors.nombre?.message} />
          <TextField label="Teléfono" fullWidth margin="normal" autoComplete="off" {...register('telefono')} error={Boolean(errors.telefono)} helperText={errors.telefono?.message} />
          <TextField label="Email" fullWidth margin="normal" autoComplete="off" {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} />
          <TextField label="Contraseña" type="password" fullWidth margin="normal" autoComplete="new-password" {...register('password')} error={Boolean(errors.password)} helperText={errors.password?.message} />
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
    </Box>
  );
}
