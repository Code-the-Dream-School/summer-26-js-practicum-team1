import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { COLORS } from './utils/constants';
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
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
