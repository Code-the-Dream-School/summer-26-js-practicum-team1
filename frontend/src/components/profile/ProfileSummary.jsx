import { Avatar, Box, Typography } from '@mui/material';

const ROLE_LABELS = {
  requester: 'Requester',
  volunteer: 'Volunteer',
  admin: 'Admin',
};

function ProfileSummary({ user }) {
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        pb: 2,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main' }}>
          {user.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#52462A' }}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.phone || 'Phone not provided'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email || 'Email not provided'}
          </Typography>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 600, color: '#8C8164' }}>
        I am a {roleLabel}
      </Typography>
    </Box>
  );
}

export default ProfileSummary;
