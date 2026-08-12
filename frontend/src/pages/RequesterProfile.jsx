import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import { useGetProfile } from '../hooks/requesterProfile/useGetProfile';
import { useGetProfileImage } from '../hooks/requesterProfile/useGetProfileImage';
import EditProfileDialog from '../components/requesterProfile/EditProfileDialog';

function RequesterProfile() {
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    phone: '',
    address: '',
    city: '',
    bio: '',
    emergencyContact: '',
  });

  const handleEdit = () => {
    setEditData({
      phone: profile.phone || '',
      address: requesterProfile?.address || '',
      city: requesterProfile?.city || '',
      bio: requesterProfile?.bio || '',
      emergencyContact: requesterProfile?.emergencyContact || '',
    });

    setEditOpen(true);
  };

  const { data, isLoading, isError } = useGetProfile();
  const {
    data: profileImage,
    isLoading: imageLoading,
    isError: imageError,
  } = useGetProfileImage();

  const formattedRole =
    profile.role.charAt(0) + profile.role.slice(1).toLowerCase();

  const profileImageUrl = useMemo(() => {
    if (!profileImage) {
      return undefined;
    }

    return URL.createObjectURL(profileImage);
  }, [profileImage]);

  if (isLoading) {
    return <CircularProgress color="success" aria-label="Loading…" />;
  }

  if (isError) {
    return <Alert severity="error">Failed to load data..</Alert>;
  }

  const profile = data?.data;

  if (!profile) {
    return <Typography>Profile not found.</Typography>;
  }

  const requesterProfile = profile.requesterProfile;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5">My Profile</Typography>

              <IconButton aria-label="Edit profile" onClick={handleEdit}>
                <EditIcon />
              </IconButton>
            </Stack>

            <Divider />

            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                src={!imageLoading && !imageError ? profileImageUrl : undefined}
                sx={{
                  width: 110,
                  height: 110,
                }}
              >
                {profile.name.charAt(0)}
              </Avatar>

              <Box>
                <Typography variant="h6">{profile.name}</Typography>

                <Typography variant="body2" color="text.secondary">
                  I am a {formattedRole}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={2}>
              <ProfileField label="Name" value={profile.name} />

              <ProfileField label="Email" value={profile.email} />

              <ProfileField label="Phone" value={profile.phone} />

              <ProfileField label="Address" value={requesterProfile?.address} />

              <ProfileField label="City" value={requesterProfile?.city} />

              <ProfileField label="Bio" value={requesterProfile?.bio} />

              <ProfileField
                label="Emergency Contact"
                value={requesterProfile?.emergencyContact}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {editOpen && (
        <EditProfileDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          formData={editData}
        />
      )}
    </Box>
  );
}

function ProfileField({ label, value }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography variant="body1">{value || 'Not provided'}</Typography>
    </Box>
  );
}

export default RequesterProfile;
