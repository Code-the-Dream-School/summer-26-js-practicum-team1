import { Outlet, Link as RouterLink } from 'react-router-dom';
import { AppBar, Box, Container, Link, Toolbar, Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext';

const MainLayout = () => {
  const { appName } = useAppContext();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {appName}
          </Typography>
          <Link component={RouterLink} to="/" color="inherit" underline="none">
            Home
          </Link>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default MainLayout;
