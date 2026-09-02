import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

import ServiceAreaPicker from '../profile/ServiceAreaPicker';
import { useUpdateProfile } from '../../hooks/requesterProfile/useUpdateProfile';

function EditProfileDialog({ open, onClose, form, setForm }) {
  const updateProfile = useUpdateProfile();
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: '',
      general: '',
    }));
  };

  const handleAddressChange = (location) => {
    setForm((previous) => ({
      ...previous,
      address: location?.label ?? '',
      city: location?.city ?? '',
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      placeId: location?.placeId ?? null,
    }));

    setErrors((previous) => ({
      ...previous,
      address: '',
      city: '',
      general: '',
    }));
  };

  const handleSubmit = () => {
    setErrors({});

    const profileData = {
      phone: form.phone,
      address: form.address,
      city: form.city,
      bio: form.bio,
      emergencyContact: form.emergencyContact,
    };

    updateProfile.mutate(profileData, {
      onSuccess: () => {
        onClose();
      },

      onError: (error) => {
        const details = error?.response?.data?.details;

        if (details) {
          const fieldErrors = {};

          details.forEach((detail) => {
            fieldErrors[detail.field] = detail.message;
          });

          setErrors(fieldErrors);
          return;
        }

        setErrors({
          general:
            error?.response?.data?.error ||
            'Unable to update profile. Please try again.',
        });
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: {
            xs: '2rem',
            sm: '2.5rem',
          },
        }}
      >
        Edit Profile
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {errors.general && <Alert severity="error">{errors.general}</Alert>}

          <TextField
            name="phone"
            label="Phone"
            value={form.phone}
            onChange={handleChange}
            error={Boolean(errors.phone)}
            helperText={errors.phone}
            fullWidth
          />

          <ServiceAreaPicker
            value={{
              label: form.address,
              city: form.city,
              latitude: form.latitude,
              longitude: form.longitude,
              placeId: form.placeId,
            }}
            onChange={handleAddressChange}
          />

          <TextField
            name="city"
            label="City"
            value={form.city}
            onChange={handleChange}
            error={Boolean(errors.city)}
            helperText={errors.city}
            fullWidth
          />

          <TextField
            name="bio"
            label="About Me"
            value={form.bio}
            onChange={handleChange}
            error={Boolean(errors.bio)}
            helperText={errors.bio}
            multiline
            rows={4}
            fullWidth
          />

          <TextField
            name="emergencyContact"
            label="Emergency Contact"
            value={form.emergencyContact}
            onChange={handleChange}
            error={Boolean(errors.emergencyContact)}
            helperText={errors.emergencyContact}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={updateProfile.isPending}
          varient="outline"

          sx={{
            border: 1,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={updateProfile.isPending}
          sx={{
            borderRadius: 1,
          }}
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditProfileDialog;
