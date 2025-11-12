import { useEffect, useState } from 'react';
import { Avatar, Box, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import { AdministradorCanchaPerfil } from '../types';
import { httpClient } from '../utils/httpClient';

const PerfilAdministradorCancha = () => {
  const [perfil, setPerfil] = useState<AdministradorCanchaPerfil | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await httpClient.get<AdministradorCanchaPerfil>('/usuarios/perfil');
        if (active) setPerfil(data);
      } catch (e) {
        if (active) setPerfil(null);
      }
    })();
    return () => { active = false; };
  }, []);

  if (!perfil) {
    return <Typography>Cargando perfil...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mi perfil
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3} display="flex" justifyContent="center" alignItems="center">
              <Avatar sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: 48 }}>
                {perfil.nombre.slice(0, 2).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs={12} md={9} container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Nombre" value={perfil.nombre} fullWidth InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Email" value={perfil.email} fullWidth InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Teléfono" value={perfil.telefono} fullWidth InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Documento" value={perfil.documento} fullWidth InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Fecha de registro"
                  value={new Date(perfil.fechaRegistro).toLocaleDateString()}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PerfilAdministradorCancha;
