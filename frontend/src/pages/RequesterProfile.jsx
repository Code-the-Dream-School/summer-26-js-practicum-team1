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
        width: '100%',
        maxWidth: 800,
        mx: 'auto',
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      <Card
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: 3,
          width: '100%',
        }}
      >
        <CardContent sx={{ ml: 5 }}>
          <Stack spacing={3}>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: {
                    xs: '2rem',
                    sm: '2.5rem',
                  },
                  fontWeight: 700,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {profile.name}
              </Typography>

              <Button
                aria-label="Edit profile"
                onClick={handleEdit}
                variant="contained"
                sx={{
                  borderRadius: 1,
                  boxShadow: 3,
                  transition: '0.3s',

                  '&:hover': {
                    boxShadow: 8,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <>
                  Edit Profile <EditIcon fontSize="small" sx={{ ml: 2 }} />
                </>
              </Button>
            </Stack>

            <Divider sx={{ borderBottomWidth: 3 }} />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 3 }}
              sx={{
                alignItems: { xs: 'center', sm: 'center' },
              }}
            >
              <Stack
                direction="column"
                spacing={3}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Avatar
                  src={`${API_URL}/api/profile/image?v=${imageVersion}`}
                  sx={{
                    width: 130,
                    height: 130,
                  }}
                >
                  {profile.name?.charAt(0).toUpperCase()}
                </Avatar>

                <Button
                  component="label"
                  variant="contained"
                  disabled={updateProfileImage.isPending}
                  sx={{
                    borderRadius: 1,
                    boxShadow: 3,
                    transition: '0.3s',

                    '&:hover': {
                      boxShadow: 8,
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {updateProfileImage.isPending ? (
                    <CircularProgress
                      color="success"
                      aria-label="Uploading Image"
                    />
                  ) : (
                    <>
                      Edit Image <EditIcon fontSize="small" sx={{ ml: 2 }} />
                    </>
                  )}

                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png"
                    onChange={handleImageChange}
                  />
                </Button>

                {updateProfileImage.isError && (
                  <Typography variant="body2" color="error">
                    Failed to update profile image.
                  </Typography>
                )}
              </Stack>

              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ fontWeight: 700 }}
              >
                I am a {formattedRole}
              </Typography>
            </Stack>

            <Stack spacing={4}>
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
      <Typography variant="h9" color="text.primary" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ fontWeight: 200 }}
      >
        {value || 'Not provided'}
      </Typography>
    </Box>
  );
}

export default RequesterProfile;
