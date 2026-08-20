import { Box, Chip, Typography } from '@mui/material';
import ProfileSection from './ProfileSection';
import { DAYS_OF_WEEK } from '../../utils/volunteerPreferences';

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

export default VolunteerPreferencesView;
