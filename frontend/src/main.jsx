import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { COLORS } from './utils/constants';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import App from './App';

const queryClient = new QueryClient();
const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.forest,
      dark: COLORS.forestDark,
    },
    secondary: {
      main: COLORS.sage,
      dark: COLORS.sageLine,
      contrastText: COLORS.forestDark,
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8F8F6',
    },
    text: {
      secondary: COLORS.grayText,
    },
    divider: COLORS.border,
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </LocalizationProvider>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
