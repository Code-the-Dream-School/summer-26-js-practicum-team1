
import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
const mockPendingRequests = [  
  {
    id: 1,
    title: 'Grocery Shopping',
    description: 'Need help picking up groceries from the store.',
    category: 'Grocery',
    urgency: 'Medium',
    date: 'Aug 12, 2026',
    address: '123 Main Street',
  },
  {
    id: 2,
    title: 'Pharmacy Pickup',
    description: 'Need someone to pick up my prescription.',
    category: 'Errands',
    urgency: 'High',
    date: 'Aug 14, 2026',
    address: '456 Oak Avenue',
  },
];

const mockAcceptedRequests = [ 
  {
    id: 3,
    title: 'Transportation',
    description: 'Need a ride to my appointment.',
    category: 'Transportation',
    urgency: 'High',
    date: 'Aug 15, 2026',
    address: '789 Pine Street',
    volunteer: {
      name: 'John Smith',
      
    },
  },
];

function RequestCard({ request, accepted = false }) {
  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {request.title}
          </Typography>

          <Chip
            label={accepted ? 'ACCEPTED' : 'PENDING'}
            size="small"
            sx={{
              fontWeight: 600,
              backgroundColor: accepted ? '#DCFCE7' : '#FEF3C7',
              color: accepted ? '#166534' : '#92400E',
            }}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {request.description}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: accepted ? 2 : 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarMonthOutlinedIcon
              fontSize="small"
              color="action"
            />
            <Typography variant="body2">
              {request.date}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnOutlinedIcon
              fontSize="small"
              color="action"
            />
            <Typography variant="body2">
              {request.address}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip
            label={`Category: ${request.category}`}
            size="small"
            variant="outlined"
          />

          <Chip
            label={`Urgency: ${request.urgency}`}
            size="small"
            variant="outlined"
          />
        </Box>

        {accepted && request.volunteer && (
          <>
            <Divider sx={{ my: 2 }} />

            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ mb: 1.5 }}
            >
              Volunteer
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Avatar>
                  {request.volunteer.name.charAt(0)}
                </Avatar>

                <Box>
                  <Typography fontWeight={600}>
                    {request.volunteer.name}
                  </Typography>

                  
                </Box>
              </Box>
            </Box>
          </>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 2,
          }}
        >
          <Button
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: '14px !important' }} />}
            size="small"
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function RequesterDashboard() {
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
    const navigate = useNavigate();
  const profileMenuOpen = Boolean(profileMenuAnchor);

  const handleProfileClick = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleEditProfile = () => {
    handleProfileClose();
    console.log('Edit Profile clicked');
  };

  const handleSignOut = () => {
    handleProfileClose();
   navigate('/')
  };

  const handleNewRequest = () => {
    navigate('/helpRequest');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',
          color: '#1E293B',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Toolbar
          sx={{
            maxWidth: '1200px',
            width: '100%',
            mx: 'auto',
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ flexGrow: 1 }}
          >
            🏠 Neighborhood Helper
          </Typography>

          <IconButton sx={{ mr: 1 }}>
            <NotificationsNoneIcon />
          </IconButton>

          <IconButton onClick={handleProfileClick}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#2563EB',
              }}
            >
              A
            </Avatar>
          </IconButton>

          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ ml: 0.5 }}
          >
            Archana
          </Typography>
        </Toolbar>
      </AppBar>

      
      <Menu
        anchorEl={profileMenuAnchor}
        open={profileMenuOpen}
        onClose={handleProfileClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem disabled>
          <Typography fontWeight={600}>
            Archana
          </Typography>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleEditProfile}>
          <EditOutlinedIcon sx={{ mr: 1.5 }} fontSize="small" />
          Edit Profile
        </MenuItem>

        <MenuItem onClick={handleSignOut}>
          <LogoutIcon sx={{ mr: 1.5 }} fontSize="small" />
          Sign Out
        </MenuItem>
      </Menu>

    
      <Box
        sx={{
          maxWidth: '1000px',
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: 5,
        }}
      >
      
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome back, Archana! 👋
          </Typography>

          <Typography color="text.secondary">
            How can we help you today?
          </Typography>
        </Box>

        {/* New Request Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleNewRequest}
          sx={{
            mb: 4,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          New Help Request
        </Button>

        {/* Request Summary */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },
            gap: 2,
            mb: 5,
          }}
        >
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Pending Requests
              </Typography>

              <Typography variant="h3" fontWeight={700}>
                {mockPendingRequests.length}
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Accepted Requests
              </Typography>

              <Typography variant="h3" fontWeight={700}>
                {mockAcceptedRequests.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Pending Requests */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            Pending Requests
          </Typography>

          {mockPendingRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
            />
          ))}
        </Box>

        {/* Accepted Requests */}
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            Accepted Requests
          </Typography>

          {mockAcceptedRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              accepted
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

