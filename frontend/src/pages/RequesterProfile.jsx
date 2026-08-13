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
  Chip,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import DoneIcon from '@mui/icons-material/Done';

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

  //const formattedRole =
  //profile.role.charAt(0) + profile.role.slice(1).toLowerCase();

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
    <>
      <Typography
        variant="h5"
        align="center"
        sx={{ margin: 3, marginLeft: 0, fontWeight: 700, mb: 3 }}
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
                spacing={{ xs: 2, sm: 3, lg: 10 }}
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
                    <Typography variant="h3">
                      {profile.name?.charAt(0).toUpperCase()}
                    </Typography>
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
                  label="REQUESTER"
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

function ProfileField({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ color: 'success.main', mt: 0.5 }}>{icon}</Box>

      <Box>
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: 700 }}
        >
          {label}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontWeight: 400 }}
        >
          {value || 'Not provided'}
        </Typography>
      </Box>
    </Stack>
  );
}
export default RequesterProfile;
