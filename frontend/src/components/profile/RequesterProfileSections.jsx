import { Typography } from '@mui/material';
import ProfileSection from './ProfileSection';

function RequesterProfileSections() {
  return (
    <>
      <ProfileSection title="About Me">
        <Typography variant="body2" color="text.secondary">
          Profile details will appear here once requester profile editing is
          connected.
        </Typography>
      </ProfileSection>

      <ProfileSection title="Emergency Contact">
        <Typography variant="body2" color="text.secondary">
          Not provided yet.
        </Typography>
      </ProfileSection>
    </>
  );
}

export default RequesterProfileSections;
