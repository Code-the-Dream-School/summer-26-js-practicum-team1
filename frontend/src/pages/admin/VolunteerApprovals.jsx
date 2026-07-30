import { Grid, Typography } from '@mui/material';
import { usePendingVolunteers } from '../../hooks/admin/usePendingVolunteers';
import VolunteerList from '../../components/admin/VolunteerList';

function VolunteerApprovals() {
  const { data: volunteers, isLoading, error } = usePendingVolunteers();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading dashboard</p>;
  }
  return (
    <>
      <Typography variant="h4" align="left" sx={{ margin: 3, marginLeft: 0 }}>
        PENDING VOLUNTEERS
      </Typography>
      <VolunteerList volunteers={volunteers} />
    </>
  );
}

export default VolunteerApprovals;
