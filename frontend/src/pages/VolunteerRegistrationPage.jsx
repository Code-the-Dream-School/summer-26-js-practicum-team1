import VolunteerRegistrationForm from '../components/VolunteerRegistrationForm';
import { Box, Typography } from '@mui/material';

const VolunteerRegistrationPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 6, sm: 8, md: 10 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: 400, sm: 560, md: 640 },
          bgcolor: 'background.paper',
          borderRadius: '24px',
          p: { xs: 3, sm: 4, md: 5 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 4,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Volunteer Registration
          </Typography>
        </Box>
        <VolunteerRegistrationForm />
      </Box>
    </Box>
  );
};

export default VolunteerRegistrationPage;
