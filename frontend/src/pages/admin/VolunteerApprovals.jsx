import { Grid, Typography } from '@mui/material';
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
    return <Alert severity="error">This is an error Alert.</Alert>;
  }
  return (
    <>
      <Typography
        variant="h5"
        align="center"
        sx={{ margin: 3, marginLeft: 0, fontWeight: 700, mb: 3 }}
      >
        PENDING VOLUNTEERS
      </Typography>
      <VolunteerList volunteers={volunteers} />
    </>
  );
}

export default VolunteerApprovals;
