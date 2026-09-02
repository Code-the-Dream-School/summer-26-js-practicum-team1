import {
  Grid,
  Box,
  CardContent,
  Typography,
  CardActions,
  Button,
  Card,
} from '@mui/material';

import { useDashboardStats } from '../../hooks/admin/useDashboardStats';
import DashboardCard from '../../components/admin/DashboardCard';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import UserChart from '../../components/admin/UserChart';
import { useUsers } from '../../hooks/admin/useUsers';

function AdminDashboard() {
  const { data, isLoading: usersLoading, isError: userError } = useUsers();
  const users = data?.users ?? [];
  const navigate = useNavigate();

  const handleNavigationVolunteers = () => {
    navigate('/admin/volunteers');
  };

  const handleNavigationUsers = () => {
    navigate('/admin/users');
  };

  const dashboardCards = [
    { id: 1, title: 'Total Users', key: 'totalUsers' },
    {
      id: 2,
      title: 'Total Requesters',
      key: 'totalRequesters',
    },
    {
      id: 3,
      title: 'Total Volunteers',
      key: 'totalVolunteers',
    },
    {
      id: 4,
      title: 'Pending Volunteers',
      key: 'pendingVolunteers',
    },
  ];
  const { data: stats = {}, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <CircularProgress color="success" aria-label="Loading…" />;
  }

  if (error) {
    return <Alert severity="error">Failed to load data..</Alert>;
  }

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          align="left"
          sx={{ marginLeft: 0, fontWeight: 700 }}
        >
          ADMIN DASHBOARD
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: { xs: 'center', sm: 'left' } }}
        >
          Explore User Details.
        </Typography>
      </Box>
      <Grid container spacing={6}>
        {dashboardCards.map((card) => (
          <Grid
            key={card.id}
            size={{
              xs: 12,
              sm: 6,
              md: 6,
            }}
          >
            <DashboardCard title={card.title} value={stats?.[card.key] ?? 0} />
          </Grid>
        ))}
        <Grid
          size={12}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Button
            size="medium"
            variant="contained"
            color="primary"
            onClick={handleNavigationVolunteers}

            sx={{
              boxShadow: 3,
              width: 400,
              transition: '0.3s',

              '&:hover': {
                boxShadow: 8,
                transform: 'translateY(-4px)',
              },
            }}
          >
            Pending Volunteers
          </Button>
          <Button
            size="medium"
            variant="contained"
            color="primary"
            onClick={handleNavigationUsers}

            sx={{
              boxShadow: 3,
              width: 400,
              transition: '0.3s',

              '&:hover': {
                boxShadow: 8,
                transform: 'translateY(-4px)',
              },
            }}
          >
            View Users
          </Button>
        </Grid>

        {usersLoading ? (
          <CircularProgress color="success" />
        ) : userError ? (
          <Alert severity="error">Failed to load users.</Alert>
        ) : (
          <UserChart users={users} />
        )}
      </Grid>
    </>
  );
}

export default AdminDashboard;
