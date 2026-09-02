import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import CakeIcon from '@mui/icons-material/Cake';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';

const ROLE_LABELS = {
  requester: 'Requester',
  volunteer: 'Volunteer',
  admin: 'Admin',
};

function ProfileSummary({
  user,
  profileImage,
  isImageLoading,
  isImageError,
  onImageChange,
  isImageUpdating,
  action,
}) {
  const roleKey = user?.role?.toLowerCase();
  const roleLabel = ROLE_LABELS[roleKey] ?? user?.role ?? '';

  const initial = user?.name?.[0]?.toUpperCase();

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: {
              xs: '2rem',
              sm: '2.5rem',
            },
            fontWeight: 700,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {user?.name}
        </Typography>

        <Box sx={{ flexShrink: 0 }}>{action}</Box>
      </Box>

      <Divider sx={{ borderBottomWidth: 3, mt: 2 }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 3, sm: 4, md: 5 }}
        sx={{
          alignItems: {
            xs: 'center',
            sm: 'center',
          },
          mt: 5,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'inline-flex',
            flexShrink: 0,
          }}
        >
          <Avatar
            src={isImageError ? undefined : profileImage || undefined}
            sx={{
              width: 110,
              height: 110,
              bgcolor: 'primary.main',
              fontSize: '2.75rem',
            }}
          >
            {isImageLoading ? <CircularProgress size={32} /> : initial}
          </Avatar>

          <IconButton
            component="label"
            aria-label="Change profile picture"
            disabled={isImageUpdating}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 2,
              width: 32,
              height: 32,
              bgcolor: 'background.paper',
              boxShadow: 3,
              border: 1,
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'grey.100',
                boxShadow: 5,
              },
            }}
          >
            {isImageUpdating ? (
              <CircularProgress size={18} />
            ) : (
              <PhotoCameraOutlinedIcon fontSize="small" />
            )}

            <input
              type="file"
              hidden
              accept="image/jpeg,image/png"
              onChange={onImageChange}
            />
          </IconButton>
        </Box>

        <Stack
          spacing={2}
          sx={{
            flex: 1,
            width: {
              xs: '100%',
              sm: 'auto',
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
            }}
          >
            <EmailOutlinedIcon color="success" />

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                wordBreak: 'break-word',
              }}
            >
              {user?.email || 'No email provided'}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
            }}
          >
            <PhoneOutlinedIcon color="success" />

            <Typography variant="body1" color="text.secondary">
              {user?.phone || 'No phone provided'}
            </Typography>
          </Stack>

          {user?.dob && (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'center',
              }}
            >
              <CakeIcon color="success" />

              <Typography variant="body1" color="text.secondary">
                {new Date(user.dob).toLocaleDateString()}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Chip
          label={roleLabel}
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            flexShrink: 0,
            backgroundColor:
              user.role === 'ADMIN'
                ? '#B33F32'
                : user.role === 'VOLUNTEER'
                  ? '#3F6B4E'
                  : '#C1791E',
            color: '#fff',
          }}
        />
      </Stack>
    </Box>
  );
}

export default ProfileSummary;
