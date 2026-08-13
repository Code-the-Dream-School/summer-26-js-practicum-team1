import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import { useGetProfile } from '../hooks/requesterProfile/useGetProfile';
import { useUpdateProfileImage } from '../hooks/requesterProfile/useUpdateProfileImage';
import EditProfileDialog from '../components/requesterProfile/EditProfileDialog';
import { API_URL } from '../utils/constants';

function RequesterProfile() {
  const [editOpen, setEditOpen] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);
  const [editData, setEditData] = useState({
    phone: '',
    address: '',
    city: '',
    bio: '',
    emergencyContact: '',
  });

  const { data, isLoading, isError } = useGetProfile();
  const updateProfileImage = useUpdateProfileImage();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <CircularProgress color="success" aria-label="Loading profile" />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Failed to load profile.</Alert>;
  }

  const profile = data?.data;

  if (!profile) {
    return <Typography>Profile not found.</Typography>;
  }

  const requesterProfile = profile.requesterProfile;

  const formattedRole =
    profile.role.charAt(0) + profile.role.slice(1).toLowerCase();

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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    updateProfileImage.mutate(file, {
      onSuccess: () => {
        setImageVersion((version) => version + 1);
      },
    });

    event.target.value = '';
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        p: 3,
      }}
    >
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
                src={`${API_URL}/api/profile/image?v=${imageVersion}`}
                sx={{
                  width: 110,
                  height: 110,
                }}
              >
                {profile.name?.charAt(0)}
              </Avatar>

              <Box>
                <Typography variant="h6">{profile.name}</Typography>

                <Typography variant="body2" color="text.secondary">
                  I am a {formattedRole}
                </Typography>

                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                  disabled={updateProfileImage.isPending}
                >
                  {updateProfileImage.isPending
                    ? 'Uploading...'
                    : 'Change Profile Image'}

                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png"
                    onChange={handleImageChange}
                  />
                </Button>

                {updateProfileImage.isError && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Failed to update profile image.
                  </Typography>
                )}
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
