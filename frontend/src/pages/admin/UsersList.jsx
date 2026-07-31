import { Typography, Box } from '@mui/material';
import UserTable from '../../components/admin/UserTable';
import UserChart from '../../components/admin/UserChart';

function UsersList() {
  return (
    <Box>
      <Typography
        variant="h5"
        align="center"
        sx={{ margin: 3, marginLeft: 0, fontWeight: 700, mb: 3 }}
      >
        USER MANAGEMENT
      </Typography>
      <UserTable />
    </Box>
  );
}

export default UsersList;
