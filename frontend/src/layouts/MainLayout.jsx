import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function MainLayout() {
  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
      <Footer />
    </>
  );
}

export default MainLayout;
