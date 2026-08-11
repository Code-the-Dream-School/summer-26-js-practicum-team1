import { useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
} from '@mui/material';

import UploadFileIcon from '@mui/icons-material/UploadFile';

const MAX_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

function ProfileImageUpload({ onFileChange }) {
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const uploadInputRef = useRef(null);

  const handleOpen = () => {
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Profile picture must be a JPEG or PNG image.');
      onFileChange(null);
      event.target.value = '';
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('Profile picture must be at most 2MB.');
      onFileChange(null);
      event.target.value = '';
      return;
    }

    onFileChange(file);

    setOpen(false);

    event.target.value = '';
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography sx={{ mb: 1 }}>Profile Picture</Typography>

      <Button
        variant="outlined"
        onClick={handleOpen}
        sx={{
          textTransform: 'none',
        }}
      >
        Add Profile Picture
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <input
        ref={uploadInputRef}
        type="file"
        hidden
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Add Profile Picture</DialogTitle>

        <DialogContent>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => uploadInputRef.current?.click()}
            sx={{
              py: 1.5,
              textTransform: 'none',
            }}
          >
            Upload Picture
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProfileImageUpload;
