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

function AdminDashboard() {
  const navigate = useNavigate();

  const handleNavigationVolunteers = () => {
    navigate('/admin/volunteers');
  };

  const handleNavigationUsers = () => {
    navigate('/admin/users');
  };

  const dashboardCards = [
    { id: 1, title: 'Total Users', key: 'totalUsers', color: '#e2ecf3' }, // Light Blue
    {
      id: 2,
      title: 'Total Requesters',
      key: 'totalRequesters',
      color: '#def5e0',
    },
    {
      id: 3,
      title: 'Total Volunteers',
      key: 'totalVolunteers',
      color: '#f7efe3',
    },
    {
      id: 4,
      title: 'Pending Volunteers',
      key: 'pendingVolunteers',
      color: '#f0e7f1',
    },
  ];
  const { data: stats = {}, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <CircularProgress color="success" aria-label="Loading…" />;
  }

  if (error) {
    return <Alert severity="error">This is an error Alert.</Alert>;
  }

  return (
    <>
      <Typography
        variant="h5"
        align="center"
        sx={{ margin: 3, marginLeft: 0, fontWeight: 700, mb: 3 }}
      >
        ADMIN DASHBOARD
      </Typography>

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
            <DashboardCard
              title={card.title}
              value={stats?.[card.key] ?? 0}
              bgColor={card.color}
            />
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
            color="success"
            onClick={handleNavigationVolunteers}

            sx={{
              borderRadius: 2,
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
            color="success"
            onClick={handleNavigationUsers}

            sx={{
              borderRadius: 2,
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
      </Grid>
    </>
  );
}

export default AdminDashboard;
