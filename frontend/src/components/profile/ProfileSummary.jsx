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
        alignItems: 'center',
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
            {roleLabel}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default ProfileSummary;
