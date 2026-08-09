import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
} from '@mui/material';

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

function ProfileImageUpload({ onFileChange }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setError('');

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Profile picture must be a JPEG or PNG image');
      onFileChange(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      setError('Profile picture must be at most 2MB');
      onFileChange(null);
      return;
    }

    // Create preview
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    // Send file back to parent component
    onFileChange(file);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Profile Picture
      </Typography>

      <Button
        variant="outlined"
        component="label"
      >
        Add Profile Picture
        <input
          type="file"
          hidden
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
        />
      </Button>

      {preview && (
        <Box sx={{ mt: 2 }}>
          <img
            src={preview}
            alt="Profile preview"
            style={{
              width: 120,
              height: 120,
              objectFit: 'cover',
              borderRadius: '50%',
            }}
          />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        JPEG or PNG only. Maximum size: 2MB.
      </Typography>
    </Box>
  );
}

export default ProfileImageUpload;