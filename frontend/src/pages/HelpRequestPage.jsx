import { useForm } from 'react-hook-form';
import {
  Box,
  TextField,
  Typography,
  Button,
  MenuItem,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCreateRequest } from '../hooks/useRequests';
import AddressAutocomplete from '../components/AddressAutocomplete';
import logo from '../assets/logo.png';

const CATEGORY_OPTIONS = [
  { value: 'GROCERY_SHOPPING', label: 'Grocery Shopping' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'HOUSEHOLD_CHORES', label: 'Household Chores' },
  { value: 'YARD_WORK', label: 'Yard Work' },
  { value: 'PET_CARE', label: 'Pet Care' },
  { value: 'TECH_SUPPORT', label: 'Tech Support' },
  { value: 'COMPANIONSHIP', label: 'Companionship' },
  { value: 'MEAL_PREPARATION', label: 'Meal Preparation' },
  { value: 'MEDICAL_ERRAND', label: 'Medical Errand' },
  { value: 'OTHER', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Please check your information and try again',
  NETWORK_ERROR: 'Something went wrong. Please try again',
};

function NewHelpRequest() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const { mutateAsync: createHelpRequest, error: createError, isPending: isCreating } =
    useCreateRequest();
  const navigate = useNavigate();

  
  register('address', { required: 'Please select an address from the list' });
  register('latitude', { required: true });
  register('longitude', { required: true });
  const addressValue = watch('address');

  const handleAddressSelect = ({ address, latitude, longitude, placeId }) => {
    setValue('address', address, { shouldValidate: true });
    setValue('latitude', latitude, { shouldValidate: true });
    setValue('longitude', longitude, { shouldValidate: true });
    setValue('placeId', placeId);
  };

  const onSubmit = async (formData) => {
    try {
      
      const scheduledAt = new Date(
        `${formData.date}T${formData.time}`
      ).toISOString();

      await createHelpRequest({
        title: formData.title,
        category: formData.category,
        urgency: formData.priority,
        scheduledAt,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        placeId: formData.placeId,
        description: formData.description,
      });

      navigate('/requests/confirmation');
    } catch (err) {
      console.error(err);
    }
  };

  const errorMessage =
    createError &&
    (ERROR_MESSAGES[createError.message] ?? ERROR_MESSAGES.NETWORK_ERROR);

  const today = new Date().toISOString().split('T')[0];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 6, sm: 8, md: 10 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: 400, sm: 460, md: 500 },
          bgcolor: 'background.paper',
          borderRadius: '24px',
          p: { xs: 3, sm: 4, md: 5 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
          <Box
            component="img"
            src={logo}
            alt="Neighborhood Helper Logo"
            sx={{ width: 25, height: 25 }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Neighborhood Helper
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Title"
            placeholder="e.g. Need a ride to the pharmacy"
            fullWidth
            sx={{ mb: 2 }}
            {...register('title', { required: 'Please add a short title' })}
            error={!!errors.title}
            helperText={errors.title?.message}
            slotProps={{ formHelperText: { id: 'title-error' } }}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />

          <TextField
            select
            label="Select Category"
            fullWidth
            defaultValue=""
            sx={{ mb: 2 }}
            {...register('category', { required: 'Please select a category' })}
            error={!!errors.category}
            helperText={errors.category?.message}
            slotProps={{ formHelperText: { id: 'category-error' } }}
            aria-describedby={errors.category ? 'category-error' : undefined}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Date"
            type="date"
            fullWidth
            sx={{ mb: 2 }}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: today },
              formHelperText: { id: 'date-error' },
            }}
            {...register('date', {
              required: 'Date is required',
              validate: (value) =>
                value >= today || 'Date cannot be in the past',
            })}
            error={!!errors.date}
            helperText={errors.date?.message}
            aria-describedby={errors.date ? 'date-error' : undefined}
          />

          <TextField
            label="Time"
            type="time"
            fullWidth
            sx={{ mb: 2 }}
            slotProps={{
              inputLabel: { shrink: true },
              formHelperText: { id: 'time-error' },
            }}
            {...register('time', { required: 'Time is required' })}
            error={!!errors.time}
            helperText={errors.time?.message}
            aria-describedby={errors.time ? 'time-error' : undefined}
          />

          <TextField
            label="Description"
            multiline
            minRows={3}
            fullWidth
            sx={{ mb: 2 }}
            placeholder="What kind of help do you need?"
            {...register('description', { maxLength: 1000 })}
            error={!!errors.description}
            helperText={errors.description?.message}
            slotProps={{ formHelperText: { id: 'description-error' } }}
            aria-describedby={
              errors.description ? 'description-error' : undefined
            }
          />

          <TextField
            select
            label="Priority"
            fullWidth
            defaultValue=""
            sx={{ mb: 2 }}
            {...register('priority', { required: 'Please select a priority' })}
            error={!!errors.priority}
            helperText={errors.priority?.message}
            slotProps={{ formHelperText: { id: 'priority-error' } }}
            aria-describedby={errors.priority ? 'priority-error' : undefined}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <AddressAutocomplete
            label="Location"
            onSelect={handleAddressSelect}
            error={!!errors.address}
            helperText={
              errors.address?.message ||
              (addressValue ? undefined : 'Select an address from the suggestions')
            }
            sx={{ mb: 1 }}
          />

          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isCreating}
              loading={isCreating}
              disableElevation
              sx={{
                px: 4,
                py: 1.2,
                fontSize: '1rem',
              }}
            >
              Create My Request
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default NewHelpRequest;