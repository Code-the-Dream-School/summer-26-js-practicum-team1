import { useState } from 'react';
import {
  Alert,
  Box,
  IconButton,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import { useAuth } from '../hooks/useAuth';
import { useGetProfile } from '../hooks/useGetProfile';
import { useVolunteerProfile } from '../hooks/useVolunteerProfile';
import { useGetProfileImage } from '../hooks/useGetProfileImage';
import { useUpdateProfileImage } from '../hooks/useUpdateProfileImage';

import ProfileSummary from '../components/profile/ProfileSummary';
import RequesterProfileView from '../components/requesterProfile/RequesterProfileView';
import VolunteerPreferencesForm from '../components/profile/VolunteerPreferencesForm';
import VolunteerPreferencesView from '../components/profile/VolunteerPreferencesView';
import EditProfileDialog from '../components/profile/EditProfileDialog';

function ProfilePage() {
  const { user } = useAuth();

  const [isRequesterEditing, setIsRequesterEditing] = useState(false);
  const [isVolunteerEditing, setIsVolunteerEditing] = useState(false);
  const [requesterFormData, setRequesterFormData] = useState({
    phone: '',
    address: '',
    city: '',
    bio: '',
    emergencyContact: '',
  });

  const isRequester = user?.role?.toLowerCase() === 'requester';
  const isVolunteer = user?.role?.toLowerCase() === 'volunteer';

  const {
    data,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useGetProfile({
    enabled: Boolean(user),
  });

  const {
    volunteer,
    saveVolunteer,
    isSaving,
    isLoading: isVolunteerLoading,
    isError: isVolunteerError,
  } = useVolunteerProfile({
    enabled: Boolean(user) && isVolunteer,
  });
  const {
    data: profileImage,
    isLoading: isImageLoading,
    isError: isImageError,
  } = useGetProfileImage();

  const updateProfileImage = useUpdateProfileImage();

  if (!user) {
    return null;
  }

  if (isProfileLoading) {
    return (
      <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
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

        <Typography variant="body2" color="text.secondary" align="center">
          Loading profile...
        </Typography>
      </Box>
    );
  }

  if (isProfileError || !data) {
    return <Alert severity="error">Failed to load profile.</Alert>;
  }

  const profile = data?.data ?? data;

  const summaryUser = {
    ...user,
    ...profile,
    role: profile.role || user.role,
  };

  const handleRequesterEdit = () => {
    const requester = profile.requesterProfile || {};

    setRequesterFormData({
      phone: profile.phone ?? '',
      address: requester.address ?? '',
      city: requester.city ?? '',
      bio: requester.bio ?? '',
      emergencyContact: requester.emergencyContact ?? '',
    });

    setIsRequesterEditing(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    updateProfileImage.mutate(file);

    event.target.value = '';
  };

  const showEditButton =
    (isRequester && !isRequesterEditing) ||
    (isVolunteer && !isVolunteerEditing);

  const verificationStatus = profile.volunteer?.verificationStatus;

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
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: 3,
          p: { xs: 3, sm: 4, md: 5 },
        }}
      >
        <ProfileSummary
          user={summaryUser}
          profileImage={profileImage}
          isImageLoading={isImageLoading}
          onImageChange={handleImageChange}
          isImageUpdating={updateProfileImage.isPending}
          isImageError={isImageError}
          action={
            showEditButton ? (
              <IconButton
                aria-label={
                  isRequester ? 'Edit profile' : 'Edit volunteer preferences'
                }
                onClick={() => {
                  if (isRequester) {
                    handleRequesterEdit();
                  } else {
                    setIsVolunteerEditing(true);
                  }
                }}
                sx={{
                  boxShadow: 2,
                  transition: '0.3s',
                  flexShrink: 0,
                  '&:hover': {
                    boxShadow: 5,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <EditOutlinedIcon />
              </IconButton>
            ) : null
          }
        />

        {isVolunteer && verificationStatus && (
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor:
                verificationStatus === 'APPROVED'
                  ? 'success.light'
                  : verificationStatus === 'REJECTED'
                    ? 'error.light'
                    : 'warning.light',
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor:
                    verificationStatus === 'APPROVED'
                      ? 'success.light'
                      : verificationStatus === 'REJECTED'
                        ? 'error.light'
                        : 'warning.light',
                  flexShrink: 0,
                }}
              >
                {verificationStatus === 'APPROVED'
                  ? '✓'
                  : verificationStatus === 'REJECTED'
                    ? '!'
                    : '⏳'}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {verificationStatus === 'APPROVED'
                    ? 'Volunteer profile approved'
                    : verificationStatus === 'REJECTED'
                      ? 'Volunteer profile not approved'
                      : 'Verification pending'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {verificationStatus === 'APPROVED'
                    ? 'You can now help requesters in your community.'
                    : verificationStatus === 'REJECTED'
                      ? 'Please contact the administrator if you have questions.'
                      : 'Your volunteer profile is currently being reviewed.'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        {isRequester && (
          <>
            <RequesterProfileView profile={profile} />

            <EditProfileDialog
              open={isRequesterEditing}
              onClose={() => setIsRequesterEditing(false)}
              form={requesterFormData}
              setForm={setRequesterFormData}
            />
          </>
        )}

        {isVolunteer && (
          <>
            {isVolunteerLoading && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Loading preferences...
              </Typography>
            )}

            {isVolunteerError && !isVolunteerEditing && (
              <Alert severity="info" sx={{ mt: 3 }}>
                Could not load preferences yet. Try editing your volunteer
                preferences again.
              </Alert>
            )}

            {isVolunteerEditing ? (
              <VolunteerPreferencesForm
                key={volunteer ? 'loaded' : 'empty'}
                initialPreferences={volunteer}
                isSaving={isSaving}
                onCancel={() => setIsVolunteerEditing(false)}
                onSave={async (payload) => {
                  await saveVolunteer(payload);
                  setIsVolunteerEditing(false);
                }}
              />
            ) : (
              !isVolunteerLoading &&
              !isVolunteerError && (
                <VolunteerPreferencesView preferences={volunteer} />
              )
            )}
          </>
        )}
      </Box>
    </>
  );
}

export default ProfilePage;
