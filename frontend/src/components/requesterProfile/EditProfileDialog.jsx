import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useUpdateProfile } from '../../hooks/requesterProfile/useUpdateProfile';

function EditProfileDialog({ open, onClose, formData }) {
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState(formData);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    updateProfile.mutate(form, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Profile</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {updateProfile.isError && (
            <Typography color="error">
              Unable to update profile. Please check your information.
            </Typography>
          )}
          <TextField
            name="phone"
            label="Phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            name="address"
            label="Address"
            value={form.address}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            name="city"
            label="City"
            value={form.city}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            name="bio"
            label="Bio"
            value={form.bio}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
          />

          <TextField
            name="emergencyContact"
            label="Emergency Contact"
            value={form.emergencyContact}
            onChange={handleChange}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={updateProfile.isPending}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditProfileDialog;
