
import { useEffect, useRef, useState } from 'react';
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

import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const AVATARS = [
  '👩',
  '👨',
  '👩‍🦰',
  '👨‍🦱',
  '👩‍🦱',
  '👨‍🦰',
  '👩‍🦳',
  '👨‍🦳',
];

const MAX_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

function ProfileImageUpload({ onFileChange }) {
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const uploadInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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

  
  const handleOpenCamera = async () => {
  setError('');
  setOpen(false);

  try {
    if (!navigator.mediaDevices?.getUserMedia) { //browser's getUserMedia() API to access the camera 
      setError('Camera access is not supported by this browser.');
      setOpen(true);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false,
    });

    console.log('Stream tracks:', stream.getVideoTracks()); // DEBUG
    console.log('Track settings:', stream.getVideoTracks()[0]?.getSettings()); // DEBUG
    
    streamRef.current = stream;
    setCameraOpen(true);
  } catch (err) {
    console.error('Camera error:', err);
    setError('Unable to access the camera. Please allow camera permission and try again.');
    setOpen(true);
  }
};

useEffect(() => {
  if (!cameraOpen || !streamRef.current) return;

  let cancelled = false;

  const attachStream = () => {
    if (cancelled) return;

    if (!videoRef.current) {
      requestAnimationFrame(attachStream);
      return;
    }

    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.muted = true;

    video.play().catch((err) => {
      console.error('Video playback error:', err);
      setError('Unable to start camera preview: ' + err.message);
    });
  };

  attachStream();

  return () => {
    cancelled = true;
  };
}, [cameraOpen]);
  
  const handleTakePicture = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      setError('Camera is not ready.');
      return;
    }

    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext('2d');

    if (!context) {
      setError('Unable to capture picture.');
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Unable to create picture.');
          return;
        }

        const file = new File(
          [blob],
          'profile-picture.jpg',
          {
            type: 'image/jpeg',
          }
        );

        if (file.size > MAX_SIZE) {
          setError('Profile picture must be at most 2MB.');
          return;
        }

        onFileChange(file);

        handleCloseCamera();
      },
      'image/jpeg',
      0.9
    );
  };

  
  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  
  const handleAvatarSelect = (avatar) => {
    setError('');

    const canvas = document.createElement('canvas');

    canvas.width = 200;
    canvas.height = 200;

    const context = canvas.getContext('2d');

    if (!context) {
      setError('Unable to create avatar.');
      return;
    }

    context.fillStyle = '#e8f5e9';
    context.fillRect(0, 0, 200, 200);

    context.font = '100px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(avatar, 100, 105);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Unable to create avatar.');
          return;
        }

        const file = new File(
          [blob],
          'profile-avatar.png',
          {
            type: 'image/png',
          }
        );

        onFileChange(file);

        setOpen(false);
      },
      'image/png'
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography sx={{ mb: 1 }}>
        Profile Picture
      </Typography>

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
        <Alert
          severity="error"
          sx={{ mt: 2 }}
          onClose={() => setError('')}
        >
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

      
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Add Profile Picture
        </DialogTitle>

        <DialogContent>
        
          <Button
            fullWidth
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() =>
              uploadInputRef.current?.click()
            }
            sx={{
              mb: 2,
              py: 1.5,
              textTransform: 'none',
            }}
          >
            Upload Picture
          </Button>

         
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PhotoCameraIcon />}
            onClick={handleOpenCamera}
            sx={{
              mb: 3,
              py: 1.5,
              textTransform: 'none',
            }}
          >
            Take Picture
          </Button>

          
          <Typography
            variant="subtitle1"
            sx={{ mb: 1 }}
          >
            Choose an Avatar
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 2,
            }}
          >
            {AVATARS.map((avatar) => (
              <Button
                key={avatar}
                onClick={() => handleAvatarSelect(avatar)}
                sx={{
                  fontSize: '2rem',
                  minWidth: 0,
                  p: 1,
                }}
              >
                {avatar}
              </Button>
            ))}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

     
      <Dialog
        open={cameraOpen}
        onClose={handleCloseCamera}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Take Profile Picture
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              width: '100%',
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                display: 'block',
                transform: 'scaleX(-1)',
              }}
            />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            Position your face in the camera and click
            "Take Photo".
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseCamera}>
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={<PhotoCameraIcon />}
            onClick={handleTakePicture}
          >
            Take Photo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProfileImageUpload;
