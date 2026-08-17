import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';

import { getMe, getHelpRequests, logout } from '../../services/api';

const SIDEBAR_WIDTH = 232;


const URGENCY_STYLES = {
  HIGH: { border: '#E24B4A', bg: '#FCEBEB', text: '#791F1F' },
  MEDIUM: { border: '#EF9F27', bg: '#FAEEDA', text: '#633806' },
  LOW: { border: '#639922', bg: '#EAF3DE', text: '#27500A' },
};

function getUrgencyStyle(urgency) {
  return URGENCY_STYLES[urgency] || URGENCY_STYLES.LOW;
}

function RequestCard({ request }) {
  const accepted = request.status === 'ACCEPTED';
  const urgencyStyle = getUrgencyStyle(request.urgency);

  return (
    <Card
      sx={{
        borderRadius: 3,
        borderLeft: `4px solid ${urgencyStyle.border}`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
            mb: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {request.title}
          </Typography>

          <Chip
            label={accepted ? 'Accepted' : 'Pending'}
            size="small"
            sx={{
              fontWeight: 600,
              flexShrink: 0,
              backgroundColor: accepted ? '#DCFCE7' : '#FEF3C7',
              color: accepted ? '#166534' : '#92400E',
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {request.description || 'No description provided.'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} color="action" />
            <Typography variant="caption" color="text.secondary">
              {request.scheduledAt
                ? new Date(request.scheduledAt).toLocaleString()
                : 'Date not available'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 16 }} color="action" />
            <Typography variant="caption" color="text.secondary" noWrap>
              {request.address || 'Address not available'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label={request.category} size="small" variant="outlined" />
          <Chip
            label={request.urgency}
            size="small"
            sx={{
              backgroundColor: urgencyStyle.bg,
              color: urgencyStyle.text,
              fontWeight: 600,
            }}
          />
        </Box>

        {accepted && request.volunteer && (
          <>
            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                {request.volunteer.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Volunteer
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {request.volunteer.name}
                </Typography>
              </Box>
            </Box>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto', pt: 1.5 }}>
          <Button
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: '12px !important' }} />}
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
  const navigate = useNavigate();

  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL | PENDING | ACCEPTED
  const [sortBy, setSortBy] = useState('SOONEST'); // SOONEST | URGENCY

  const profileMenuOpen = Boolean(profileMenuAnchor);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const currentUser = await getMe();

        if (!currentUser) {
          navigate('/login');
          return;
        }

        setUser(currentUser);

        const response = await getHelpRequests();
        setRequests(response.data || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Unable to load your requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleProfileClick = (event) => setProfileMenuAnchor(event.currentTarget);
  const handleProfileClose = () => setProfileMenuAnchor(null);

  const handleEditProfile = () => {
    handleProfileClose();
    navigate('/profile');
  };

  const handleSignOut = async () => {
    handleProfileClose();
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const handleNewRequest = () => navigate('/helpRequest');

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'PENDING'),
    [requests]
  );
  const acceptedRequests = useMemo(
    () => requests.filter((r) => r.status === 'ACCEPTED'),
    [requests]
  );

  const urgencyRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };

  const visibleRequests = useMemo(() => {
    let list = requests;
    if (filter === 'PENDING') list = pendingRequests;
    if (filter === 'ACCEPTED') list = acceptedRequests;

    const sorted = [...list];
    if (sortBy === 'URGENCY') {
      sorted.sort(
        (a, b) => (urgencyRank[a.urgency] ?? 3) - (urgencyRank[b.urgency] ?? 3)
      );
    } else {
      sorted.sort(
        (a, b) => new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0)
      );
    }
    return sorted;
  }, [requests, pendingRequests, acceptedRequests, filter, sortBy]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const navItemSx = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 1.25,
    py: 1,
    borderRadius: 2,
    cursor: 'pointer',
    backgroundColor: active ? '#EEF2FF' : 'transparent',
    color: active ? '#1E293B' : 'text.secondary',
    '&:hover': { backgroundColor: '#F1F5F9' },
  });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          px: 3,
          py: 1.5,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <IconButton>
          <NotificationsNoneIcon />
        </IconButton>

        <IconButton onClick={handleProfileClick} sx={{ p: 0.5 }}>
          <Avatar sx={{ width: 36, height: 36, backgroundColor: '#2563EB' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        </IconButton>

        <Typography variant="body2" fontWeight={600}>
          {user?.name || 'User'}
        </Typography>
      </Box>

      <Menu
        anchorEl={profileMenuAnchor}
        open={profileMenuOpen}
        onClose={handleProfileClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled>
          <Typography fontWeight={600}>{user?.name || 'User'}</Typography>
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

      <Box sx={{ display: 'flex', maxWidth: '1200px', mx: 'auto' }}>
        
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            px: 2,
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            🏠 Neighborhood Helper
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewRequest}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            New Request
          </Button>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">
                  Pending
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {pendingRequests.length}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">
                  Accepted
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {acceptedRequests.length}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
            <Box sx={navItemSx(true)}>
              <ListAltOutlinedIcon fontSize="small" />
              <Typography variant="body2">My requests</Typography>
            </Box>
            <Box sx={navItemSx(false)} onClick={handleEditProfile}>
              <PersonOutlineIcon fontSize="small" />
              <Typography variant="body2">Profile</Typography>
            </Box>
          </Box>
        </Box>

        
        <Box sx={{ flexGrow: 1, minWidth: 0, px: 3, py: 4 }}>
          <Box   sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Welcome back, {user?.name || 'User'}! 👋
            </Typography>
            <Typography color="text.secondary">How can we help you today?</Typography>
          </Box>

          {error && (
            <Typography color="error"   sx={{ mb: 3 }}>
              {error}
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3,
              flexWrap: 'wrap',
            }}
          >
            {['ALL', 'PENDING', 'ACCEPTED'].map((key) => (
              <Chip
                key={key}
                label={key.charAt(0) + key.slice(1).toLowerCase()}
                onClick={() => setFilter(key)}
                sx={{
                  fontWeight: 600,
                  backgroundColor: filter === key ? '#1E293B' : 'transparent',
                  color: filter === key ? '#FFFFFF' : 'text.secondary',
                  border: filter === key ? 'none' : '1px solid #E2E8F0',
                  '&:hover': {
                    backgroundColor: filter === key ? '#1E293B' : '#F1F5F9',
                  },
                }}
              />
            ))}

            <Select
              size="small"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ ml: 'auto', minWidth: 160, backgroundColor: '#FFFFFF' }}
            >
              <MenuItem value="SOONEST">Sort: soonest</MenuItem>
              <MenuItem value="URGENCY">Sort: urgency</MenuItem>
            </Select>
          </Box>

          {visibleRequests.length === 0 ? (
            <Typography color="text.secondary">
              You don't have any {filter !== 'ALL' ? filter.toLowerCase() : ''} requests.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
              }}
            >
              {visibleRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
