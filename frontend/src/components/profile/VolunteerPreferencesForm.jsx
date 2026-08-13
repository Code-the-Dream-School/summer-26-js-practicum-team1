import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ProfileSection from './ProfileSection';
import { DAYS_OF_WEEK } from '../../utils/volunteerPreferences';
import { useSupportCategories } from '../../hooks/useSupportCategories';

const emptySlot = { dayOfWeek: 'MON', startTime: '09:00', endTime: '12:00' };

function VolunteerPreferencesForm({
  initialPreferences,
  isSaving,
  onSave,
  onCancel,
}) {
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useSupportCategories();

  const [serviceArea, setServiceArea] = useState(
    () => initialPreferences?.serviceArea ?? ''
  );
  const [interestIds, setInterestIds] = useState(
    () => initialPreferences?.interests?.map((item) => item.id) ?? []
  );
  const [slots, setSlots] = useState(() =>
    initialPreferences?.availability?.slots?.length
      ? initialPreferences.availability.slots
      : [emptySlot]
  );
  const [error, setError] = useState('');

  const toggleInterest = (id) => {
    setInterestIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

  const updateSlot = (index, field, value) => {
    setSlots((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  const addSlot = () => {
    if (slots.length >= 14) return;
    setSlots((current) => [...current, { ...emptySlot }]);
  };

  const removeSlot = (index) => {
    setSlots((current) =>
      current.filter((_, slotIndex) => slotIndex !== index)
    );
  };

  const handleSubmit = async () => {
    setError('');
    try {
      await onSave({
        serviceArea: serviceArea.trim() || null,
        interestIds,
        availability: {
          frequency: 'WEEKLY',
          slots,
        },
      });
    } catch (err) {
      setError('Could not save preferences. Please try again.');
      console.error(err);
    }
  };

  return (
    <Box component="form" onSubmit={(event) => event.preventDefault()}>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <ProfileSection title="Service Area">
        <TextField
          fullWidth
          label="Where do you want to volunteer?"
          placeholder="Boston, MA or your neighborhood"
          value={serviceArea}
          onChange={(event) => setServiceArea(event.target.value)}
        />
      </ProfileSection>

      <ProfileSection title="Interests">
        {isLoadingCategories && <CircularProgress size={24} />}
        {isCategoriesError && (
          <Alert severity="error">Could not load interest categories.</Alert>
        )}
        {!isLoadingCategories && !isCategoriesError && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                clickable
                color={
                  interestIds.includes(category.id) ? 'primary' : 'default'
                }
                variant={
                  interestIds.includes(category.id) ? 'filled' : 'outlined'
                }
                onClick={() => toggleInterest(category.id)}
              />
            ))}
          </Box>
        )}
      </ProfileSection>

      <ProfileSection title="Availability">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Weekly schedule
        </Typography>

        {slots.map((slot, index) => (
          <Box
            key={`${slot.dayOfWeek}-${index}`}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1.4fr 1fr 1fr auto' },
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Day</InputLabel>
              <Select
                label="Day"
                value={slot.dayOfWeek}
                onChange={(event) =>
                  updateSlot(index, 'dayOfWeek', event.target.value)
                }
              >
                {DAYS_OF_WEEK.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Start"
              type="time"
              value={slot.startTime}
              onChange={(event) =>
                updateSlot(index, 'startTime', event.target.value)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="End"
              type="time"
              value={slot.endTime}
              onChange={(event) =>
                updateSlot(index, 'endTime', event.target.value)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <IconButton
              aria-label="Remove availability slot"
              onClick={() => removeSlot(index)}
              disabled={slots.length === 1}
            >
              <DeleteOutlinedIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          variant="outlined"
          onClick={addSlot}
          disabled={slots.length >= 14}
        >
          Add time slot
        </Button>
      </ProfileSection>

      <Box sx={{ mt: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          type="button"
          variant="contained"
          onClick={handleSubmit}
          disabled={isSaving || isLoadingCategories || isCategoriesError}
          sx={{ borderRadius: '999px', px: 4 }}
        >
          {isSaving ? 'Saving...' : 'Save preferences'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="text"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default VolunteerPreferencesForm;
