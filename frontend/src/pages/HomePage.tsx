import { Paper, Typography } from '@mui/material';
import ContactForm from '../components/ContactForm';
import HelloMessage from '../components/HelloMessage';

const HomePage = () => {
  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Frontend ↔ Backend Test
        </Typography>
        <HelloMessage />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Contact Form
        </Typography>
        <ContactForm />
      </Paper>
    </>
  );
};

export default HomePage;
