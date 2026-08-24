import { Typography, Box } from '@mui/material';
import UserTable from '../../components/admin/UserTable';

const TITLE_COLOR = '#52462A';

function UsersList() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        mx: 'auto',
        pb: 4,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 600,
            color: TITLE_COLOR,
            mb: 0.5,
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          User Management
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: { xs: 'center', sm: 'left' } }}
        >
          Search and review user accounts by role.
        </Typography>
      </Box>
      <UserTable />
    </Box>
  );
}

export default UsersList;
