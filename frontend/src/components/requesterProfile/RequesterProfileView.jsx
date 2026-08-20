import { Stack } from '@mui/material';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ContactEmergencyOutlinedIcon from '@mui/icons-material/ContactEmergencyOutlined';

import ProfileField from './ProfileField';

function RequesterProfileView({ profile }) {
  const requester = profile?.requesterProfile;

  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      <ProfileField
        icon={<PhoneOutlinedIcon />}
        label="Phone"
        value={profile?.phone}
      />

      <ProfileField
        icon={<LocationOnOutlinedIcon />}
        label="Address"
        value={requester?.address}
      />

      <ProfileField
        icon={<LocationCityOutlinedIcon />}
        label="City"
        value={requester?.city}
      />

      <ProfileField
        icon={<InfoOutlinedIcon />}
        label="Bio"
        value={requester?.bio}
      />

      <ProfileField
        icon={<ContactEmergencyOutlinedIcon />}
        label="Emergency Contact"
        value={requester?.emergencyContact}
      />
    </Stack>
  );
}

export default RequesterProfileView;
