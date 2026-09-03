import { Avatar, Box, Typography } from '@mui/material';

const VolunteerPendingNotice = ({user}) => {

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
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
  Your account is under review. We'll notify you once an admin approves your
  volunteer application.
</Typography>
</Box>
      </Box>
    </Box>
)
}

export default VolunteerPendingNotice;