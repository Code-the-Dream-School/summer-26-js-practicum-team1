import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';
import Header from '../components/Header.jsx';

function MainLayout() {
  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}

export default MainLayout;
