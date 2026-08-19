import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
  Chip,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import DoneIcon from '@mui/icons-material/Done';
import CakeIcon from '@mui/icons-material/Cake';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';

import { useGetProfile } from '../hooks/requesterProfile/useGetProfile';
import { useUpdateProfileImage } from '../hooks/requesterProfile/useUpdateProfileImage';
import { useGetProfileImage } from '../hooks/requesterProfile/useGetProfileImage';
import EditProfileDialog from '../components/requesterProfile/EditProfileDialog';
import ProfileField from '../components/requesterProfile/ProfileField';

function RequesterProfile() {
  const [editOpen, setEditOpen] = useState(false);

  const [editData, setEditData] = useState({
    phone: '',
    address: '',
    city: '',
    bio: '',
    emergencyContact: '',
  });

  const {
    data: profileImage,
    isLoading: isImageLoading,
    isError: isImageError,
  } = useGetProfileImage();
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

    updateProfileImage.mutate(file);

    event.target.value = '';
  };

  return (
    <>
      <Typography
        variant="h5"
        align="center"
        sx={{
          margin: 3,
          marginLeft: 0,
          fontWeight: 700,
          mb: 3,
        }}
      >
        MY PROFILE
      </Typography>

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
          <CardContent
            sx={{
              ml: { xs: 0, sm: 5 },
            }}
          >
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

                <IconButton
                  aria-label="Edit profile"
                  onClick={handleEdit}
                  sx={{
                    boxShadow: 2,
                    transition: '0.3s',

                    '&:hover': {
                      boxShadow: 5,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Stack>

              <Divider sx={{ borderBottomWidth: 3 }} />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 3, sm: 3, md: 5, lg: 6 }}
                sx={{
                  alignItems: {
                    xs: 'center',
                    sm: 'center',
                  },
                }}
              >
                <Stack
                  direction="column"
                  spacing={2}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-flex',
                    }}
                  >
                    <Avatar
                      src={isImageError ? undefined : profileImage || undefined}
                      sx={{
                        width: 130,
                        height: 130,
                        fontSize: '3rem',
                      }}
                    >
                      {isImageLoading ? (
                        <CircularProgress size={35} />
                      ) : (
                        profile.name?.charAt(0).toUpperCase()
                      )}
                      {profile.name?.charAt(0).toUpperCase()}
                    </Avatar>

                    <IconButton
                      component="label"
                      aria-label="Change profile picture"
                      disabled={updateProfileImage.isPending}
                      sx={{
                        position: 'absolute',
                        bottom: 1,
                        left: 4,
                        width: 28,
                        height: 28,
                        bgcolor: 'background.paper',
                        boxShadow: 3,
                        border: 1,
                        borderColor: 'divider',
                        transition: '0.3s',

                        '&:hover': {
                          bgcolor: 'grey.100',
                          boxShadow: 5,
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      {updateProfileImage.isPending ? (
                        <CircularProgress size={20} />
                      ) : (
                        <PhotoCameraOutlinedIcon fontSize="small" />
                      )}

                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/png"
                        onChange={handleImageChange}
                      />
                    </IconButton>
                  </Box>

                  {updateProfileImage.isError && (
                    <Typography variant="body2" color="error" align="center">
                      Failed to update profile image.
                    </Typography>
                  )}
                </Stack>

                <Box>
                  <ProfileField
                    icon={<EmailOutlinedIcon />}
                    label="Email"
                    value={profile.email}
                  />

                  <ProfileField
                    icon={<PhoneOutlinedIcon />}
                    label="Phone"
                    value={profile.phone}
                  />
                </Box>

                <Chip
                  label={formattedRole}
                  icon={<DoneIcon />}
                  color="warning"
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                />
              </Stack>

              <Stack spacing={{ xs: 2, sm: 3, lg: 4 }}>
                <ProfileField
                  icon={<DescriptionOutlinedIcon />}
                  label="About Me"
                  value={requesterProfile?.bio}
                />

                <ProfileField
                  icon={<CakeIcon />}
                  label="Date of Birth"
                  value={
                    profile.dob
                      ? new Date(profile.dob).toLocaleDateString()
                      : ''
                  }
                />

                <ProfileField
                  icon={<HomeOutlinedIcon />}
                  label="Address"
                  value={requesterProfile?.address}
                />

                <ProfileField
                  icon={<LocationCityOutlinedIcon />}
                  label="City"
                  value={requesterProfile?.city}
                />

                <ProfileField
                  icon={<ContactPhoneOutlinedIcon />}
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
    </>
  );
}

export default RequesterProfile;
