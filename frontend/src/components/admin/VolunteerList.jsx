import { Grid } from '@mui/material';
import VolunteerCard from './VolunteerCard';

function VolunteerList({ volunteers }) {
  return (
    <Grid container spacing={3}>
      {volunteers.map((volunteer) => (
        <Grid key={volunteer.id} size={{ xs: 12, md: 12 }}>
          <VolunteerCard {...volunteer} />
        </Grid>
      ))}
    </Grid>
  );
}

export default VolunteerList;
