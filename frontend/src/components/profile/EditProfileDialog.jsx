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

import { useUpdateProfile } from '../../hooks/requesterProfile/useUpdateProfile';

const EMPTY_FORM = {
  phone: '',
  address: '',
  city: '',
  bio: '',
  emergencyContact: '',
};

function EditProfileDialog({ open, onClose, formData }) {
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const handleOpen = () => {
    if (!open) {
      return;
    }

    setForm({
      phone: formData?.phone ?? '',
      address: formData?.address ?? '',
      city: formData?.city ?? '',
      bio: formData?.bio ?? '',
      emergencyContact: formData?.emergencyContact ?? '',
    });

    setErrors({});
  };

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

  const handleSubmit = () => {
    setErrors({});

    updateProfile.mutate(form, {
      onSuccess: () => {
        onClose();
      },

      onError: (error) => {
        const details = error?.response?.data?.details;

        if (Array.isArray(details)) {
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
    <Dialog
      open={open}
      onClose={onClose}
      onTransitionEnter={handleOpen}
      fullWidth
      maxWidth="sm"
    >
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

          <TextField
            name="address"
            label="Address"
            value={form.address}
            onChange={handleChange}
            error={Boolean(errors.address)}
            helperText={errors.address}
            fullWidth
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
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={updateProfile.isPending}
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
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditProfileDialog;
