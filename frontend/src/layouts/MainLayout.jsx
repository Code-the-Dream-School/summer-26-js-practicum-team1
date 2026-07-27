import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

function MainLayout() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Outlet />
    </Container>
  );
}

export default MainLayout;
