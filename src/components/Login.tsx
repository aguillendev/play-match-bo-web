import { useEffect } from 'react';
import { Box, Button, Paper, TextField, Typography, Alert } from '@mui/material';
import logoUrl from '../assets/play_match_logo.svg';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email requerido'),
  password: yup.string().required('Contraseña requerida'),
});

type FormData = yup.InferType<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { token, loading, error, init, doLogin } = useAuthStore((s) => ({
    token: s.token,
    loading: s.loading,
    error: s.error,
    init: s.init,
    doLogin: s.doLogin,
  }));
  const { register, handleSubmit, formState } = useForm<FormData>({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const onSubmit = async (data: FormData) => {
    const ok = await doLogin(data.email, data.password);
    if (ok) navigate('/dashboard', { replace: true });
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" px={2} sx={{ backgroundColor: '#208f4b' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <img src={logoUrl} alt="PlayMatch" style={{ height: 64 }} />
        </Box>
        <Typography
          variant="h5"
          align="center"
          sx={{
            fontFamily: 'Montserrat, Poppins, "Avenir Next", "Futura PT", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: 'primary.main',
            mb: 1,
          }}
        >
          PLAY MATCH
        </Typography>
        <Typography variant="h5" gutterBottom>
          Iniciar sesión
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField label="Email" fullWidth margin="normal" {...register('email')} error={Boolean(formState.errors.email)} helperText={formState.errors.email?.message} />
          <TextField label="Contraseña" type="password" fullWidth margin="normal" {...register('password')} error={Boolean(formState.errors.password)} helperText={formState.errors.password?.message} />
          {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
          <Button component={RouterLink} to="/register" fullWidth sx={{ mt: 1 }}>
            Crear cuenta
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
