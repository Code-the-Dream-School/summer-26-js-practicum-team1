import { useState } from 'react';
import { Alert, Box, Chip, IconButton, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useAuth } from '../hooks/useAuth';
import { useVolunteerPreferences } from '../hooks/useVolunteerPreferences';
import ProfileSummary from '../components/profile/ProfileSummary';
import VolunteerPreferencesForm from '../components/profile/VolunteerPreferencesForm';
import ProfileSection from '../components/profile/ProfileSection';
import { DAYS_OF_WEEK } from '../utils/volunteerPreferences';

const dayLabels = Object.fromEntries(
  DAYS_OF_WEEK.map((day) => [day.value, day.label])
);

function VolunteerPreferencesView({ preferences }) {
  const slots = preferences?.availability?.slots ?? [];

  return (
    <>
      <ProfileSection title="Service area">
        {preferences?.serviceArea ? (
          <Typography variant="body2">{preferences.serviceArea}</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No service area selected yet.
          </Typography>
        )}
      </ProfileSection>

      <ProfileSection title="Interests">
        {preferences?.interests?.length ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {preferences.interests.map((interest) => (
              <Chip key={interest.id} label={interest.name} color="primary" />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No interests selected yet.
          </Typography>
        )}
      </ProfileSection>

      <ProfileSection title="Availability">
        {slots.length ? (
          slots.map((slot, index) => (
            <Typography
              key={`${slot.dayOfWeek}-${index}`}
              variant="body2"
              sx={{ mb: 0.5 }}
            >
              {dayLabels[slot.dayOfWeek]}: {slot.startTime} – {slot.endTime}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No availability added yet.
          </Typography>
        )}
      </ProfileSection>
    </>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const isVolunteer = user?.role === 'volunteer';

  const { preferences, isLoading, isError, savePreferences, isSaving } =
    useVolunteerPreferences({
      enabled: isVolunteer,
    });

  if (!user) {
    return null;
  }

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

        {isVolunteer && !isEditing && (
          <IconButton
            aria-label="Edit preferences"
            onClick={() => setIsEditing(true)}
            sx={{ color: '#8C8164' }}
          >
            <EditOutlinedIcon />
          </IconButton>
        )}
      </Box>

      <ProfileSummary user={user} />

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
              key={preferences ? 'loaded' : 'empty'}
              initialPreferences={preferences}
              isSaving={isSaving}
              onCancel={() => setIsEditing(false)}
              onSave={async (payload) => {
                await savePreferences(payload);
                setIsEditing(false);
              }}
            />
          ) : (
            !isLoading &&
            !isError && <VolunteerPreferencesView preferences={preferences} />
          )}
        </>
      )}
    </Box>
  );
}

export default ProfilePage;
