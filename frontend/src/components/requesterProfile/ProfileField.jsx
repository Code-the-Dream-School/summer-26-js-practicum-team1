import { Box, Stack, Typography } from '@mui/material';
function ProfileField({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ color: 'success.main', mt: 0.5 }}>{icon}</Box>

      <Box>
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: 700 }}
        >
          {label}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            opacity: value ? 1 : 0.6,
            fontStyle: value ? 'normal' : 'italic',
          }}
        >
          {value?.trim() || 'Click Edit to add your information'}
        </Typography>
      </Box>
    </Stack>
  );
}

export default ProfileField;
