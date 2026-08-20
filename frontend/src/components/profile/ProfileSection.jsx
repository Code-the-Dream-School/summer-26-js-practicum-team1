import { Box, Typography } from '@mui/material';

function ProfileSection({ title, children }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: '#52462A', mb: 1 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default ProfileSection;
