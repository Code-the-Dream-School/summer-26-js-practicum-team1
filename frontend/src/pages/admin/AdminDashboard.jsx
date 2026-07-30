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
//import { teal } from '@mui/material/colors';

function AdminDashboard() {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/admin/volunteers');
  };

  const dashboardCards = [
    { title: 'Total Users', key: 'totalUsers', color: '#e2ecf3' }, // Light Blue
    { title: 'Total Requesters', key: 'totalRequesters', color: '#def5e0' }, // Light Green
    { title: 'Total Volunteers', key: 'totalVolunteers', color: '#f7efe3' }, // Light Orange
    { title: 'Pending Volunteers', key: 'pendingVolunteers', color: '#f0e7f1' }, // Light Purple
  ];
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading dashboard</p>;
  }

  return (
    <>
      <Typography variant="h4" align="left" sx={{ margin: 3, marginLeft: 0 }}>
        ADMIN DASHBOARD
      </Typography>
      <Grid container spacing={6}>
        {dashboardCards.map((card) => (
          <Grid size={6}>
            <DashboardCard
              title={card.title}
              value={stats[card.key]}
              bgColor={card.color}
            />
          </Grid>
        ))}
        <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            size="medium"
            variant="contained"
            color="success"
            onClick={handleNavigation}
            fullwidth
            sx={{
              borderRadius: 2,
              boxShadow: 3,
              transition: '0.3s',

              '&:hover': {
                boxShadow: 8,
                transform: 'translateY(-4px)',
              },
            }}
          >
            Pending Volunteers
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default AdminDashboard;
