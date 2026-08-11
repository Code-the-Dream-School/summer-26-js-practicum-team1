import { useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useAuth } from '../hooks/useAuth';
import { useVolunteerPreferences } from '../hooks/useVolunteerPreferences';
import ProfileSummary from '../components/profile/ProfileSummary';
import RequesterProfileSections from '../components/profile/RequesterProfileSections';
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
      <ProfileSection title="Service Area">
        <Typography variant="body2" color="text.secondary">
          {preferences?.serviceArea || 'Not provided yet.'}
        </Typography>
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
            <Typography key={`${slot.dayOfWeek}-${index}`} variant="body2" sx={{ mb: 0.5 }}>
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
  const {
    preferences,
    isLoading,
    isError,
    savePreferences,
    isSaving,
  } = useVolunteerPreferences({
    enabled: Boolean(user && user.role !== 'admin'),
  });

  if (!user) {
    return null;
  }

  const showRequesterSections = user.role === 'requester';
  const showVolunteerSections =
    user.role === 'volunteer' || preferences || isEditing || isLoading;
  const canEditVolunteerPrefs = user.role !== 'admin';

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

        {canEditVolunteerPrefs && showVolunteerSections && !isEditing && (
          <IconButton
            aria-label="Edit profile"
            onClick={() => setIsEditing(true)}
            sx={{ color: '#8C8164' }}
          >
            <EditOutlinedIcon />
          </IconButton>
        )}
      </Box>

      <ProfileSummary user={user} />

      {showRequesterSections && <RequesterProfileSections />}

      {showVolunteerSections && (
        <>
          {isLoading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Loading preferences...
            </Typography>
          )}

          {isError && !isEditing && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Volunteer preferences are not available yet. Use edit to set them up
              once your volunteer profile is ready.
            </Alert>
          )}

          {isEditing ? (
            <VolunteerPreferencesForm
              key={preferences ? 'loaded' : 'empty'}
              initialPreferences={preferences}
              isSaving={isSaving}
              onSave={async (payload) => {
                await savePreferences(payload);
                setIsEditing(false);
              }}
            />
          ) : (
            !isLoading && <VolunteerPreferencesView preferences={preferences} />
          )}
        </>
      )}
    </Box>
  );
}

export default ProfilePage;
