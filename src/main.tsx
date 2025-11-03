import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';

const montserratStack = 'Montserrat, Poppins, "Avenir Next", "Futura PT", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const theme = createTheme({
  palette: {
    primary: {
      main: '#208f4b', // verde brand
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFFFFF',
      contrastText: '#208f4b',
    },
  },
  typography: {
    fontFamily: montserratStack,
    h1: { fontFamily: montserratStack, fontWeight: 800 },
    h2: { fontFamily: montserratStack, fontWeight: 800 },
    h3: { fontFamily: montserratStack, fontWeight: 800 },
    h4: { fontFamily: montserratStack, fontWeight: 800 },
    h5: { fontFamily: montserratStack, fontWeight: 800 },
    h6: { fontFamily: montserratStack, fontWeight: 800 },
    button: { fontFamily: montserratStack, fontWeight: 700, textTransform: 'none' },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
