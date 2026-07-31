import { Typography, Box } from '@mui/material';
import UserTable from '../../components/admin/UserTable';

function UsersList() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        USER MANAGEMENT
      </Typography>

      <UserTable />
    </Box>
  );
}

export default UsersList;
