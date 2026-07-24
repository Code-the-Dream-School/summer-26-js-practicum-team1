import { Paper, Typography } from '@mui/material';
import HelloMessage from '../components/HelloMessage';

const HomePage = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Frontend ↔ Backend Test
      </Typography>
      <HelloMessage />
    </Paper>
  );
};

export default HomePage;
