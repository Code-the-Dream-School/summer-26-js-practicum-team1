import VolunteerPendingNotice from '../components/profile/VolunteerPendingNotice';
import { Avatar, Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const VolunteerPendingPage = () => {
  const { user, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return <p>Checking profile</p>;
  }

  if (!user) {
    return null;
  }

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
        <VolunteerPendingNotice user={user} />
      </Box>
    </Box>
  );
};

export default VolunteerPendingPage;
