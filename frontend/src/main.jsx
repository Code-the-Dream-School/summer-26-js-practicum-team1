import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient();
const theme = createTheme({
  palette: {
    primary: {
      main: '#1B741B',
      dark: '#165D16',
    },
    secondary: {
      main: '#E8F0E7',
      dark: '#D9E6D8',
      contrastText: '#3A5A39',
    },
    olive: {
      main: '#A6BA91',
      dark: '#8FA378',
      contrastText: '#fff',
    },
    charcoal: {
      main: '#2B2E28',
      dark: '#1E211C',
      contrastText: '#fff',
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
