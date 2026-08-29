import { Typography, Box } from '@mui/material';
import { usePendingVolunteers } from '../../hooks/admin/usePendingVolunteers';
import VolunteerList from '../../components/admin/VolunteerList';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

function VolunteerApprovals() {
  const { data, isLoading, error } = usePendingVolunteers();
  const volunteers = data?.volunteers ?? [];

  if (isLoading) {
    return <CircularProgress color="success" aria-label="Loading…" />;
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load Data.. Checking Connections...
      </Alert>
    );
  }
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          align="left"
          sx={{ marginLeft: 0, fontWeight: 700 }}
        >
          PENDING VOLUNTEERS
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: { xs: 'center', sm: 'left' } }}
        >
          View Pending Volunteers.
        </Typography>
      </Box>
      <VolunteerList volunteers={volunteers} />
    </>
  );
}

export default VolunteerApprovals;
