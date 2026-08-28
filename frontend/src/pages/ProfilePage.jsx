import { useState } from 'react';
import { Alert, Box, IconButton, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useAuth } from '../hooks/useAuth';
import { useVolunteerProfile } from '../hooks/useVolunteerProfile';
import ProfileSummary from '../components/profile/ProfileSummary';
import VolunteerPreferencesForm from '../components/profile/VolunteerPreferencesForm';
import VolunteerPreferencesView from '../components/profile/VolunteerPreferencesView';
import VolunteerPendingNotice from '../components/profile/VolunteerPendingNotice';

function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const isVolunteer = user?.role === 'volunteer';

  const { profile, volunteer, isLoading, isError, saveVolunteer, isSaving } =
    useVolunteerProfile({
      enabled: Boolean(user),
    });

  const isPending = volunteer?.verificationStatus === 'PENDING';

  if (!user) {
    return null;
  }

  const summaryUser = profile
    ? { ...user, ...profile, role: profile.role || user.role }
    : user;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '24px',
        p: { xs: 3, sm: 4, md: 5 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#52462A' }}>
          My Profile
        </Typography>

        {isVolunteer && !isEditing && !isLoading && (
          <IconButton
            aria-label="Edit preferences"
            onClick={() => setIsEditing(true)}
            sx={{ color: '#8C8164' }}
          >
            <EditOutlinedIcon />
          </IconButton>
        )}
      </Box>

      <ProfileSummary user={summaryUser} />

      {isPending && <VolunteerPendingNotice user={summaryUser}/>}

      {isVolunteer && (
        <>
          {isLoading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Loading preferences...
            </Typography>
          )}

          {isError && !isEditing && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Could not load preferences yet. Tap edit to try saving once your
              volunteer profile is ready.
            </Alert>
          )}

          {isEditing ? (
            <VolunteerPreferencesForm
              key={volunteer ? 'loaded' : 'empty'}
              initialPreferences={volunteer}
              isSaving={isSaving}
              onCancel={() => setIsEditing(false)}
              onSave={async (payload) => {
                await saveVolunteer(payload);
                setIsEditing(false);
              }}
            />
          ) : (
            !isLoading &&
            !isError && <VolunteerPreferencesView preferences={volunteer} />
          )}
        </>
      )}
    </Box>
  );
}

export default ProfilePage;
