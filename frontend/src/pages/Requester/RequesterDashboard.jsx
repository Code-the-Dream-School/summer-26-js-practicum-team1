import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

import { getMe, getHelpRequests } from '../../services/api';

const URGENCY_STYLES = {
  HIGH: {
    border: '#9b1518ff',
    bg: '#e82618ff',
    text: '#FFF1F0',
  },

  MEDIUM: {
    border: '#FFB020',
    bg: '#FFB020',
    text: '#FFF8E1',
  },

  LOW: {
    border: '#22C55E',
    bg: '#15803D',
    text: '#FFF8E1',
  },
};

const STATUS_STYLES = {
  PENDING: {
    label: 'Pending',
    bg: '#FEF3C7',
    text: '#e33f3fff',
  },
  ACCEPTED: {
    label: 'Accepted',
    bg: '#DCFCE7',
    text: '#166534',
  },
  COMPLETED: {
    label: 'Completed',
    bg: '#E0E7FF',
    text: '#3730A3',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: '#FEE2E2',
    text: '#991B1B',
  },
};

function getUrgencyStyle(urgency) {
  return URGENCY_STYLES[urgency] || URGENCY_STYLES.LOW;
}

function getStatusStyle(status) {
  return STATUS_STYLES[status] || STATUS_STYLES.PENDING;
}

function RequestCard({
  request,
  expandedRequest,
  setExpandedRequest,
}) {
  const accepted = request.status === 'ACCEPTED';

  const urgencyStyle = getUrgencyStyle(request.urgency);
  const statusStyle = getStatusStyle(request.status);

  const isExpanded = expandedRequest === request.id;

  const handleToggleDetails = () => {
    setExpandedRequest(isExpanded ? null : request.id);
  };

  return (
    <Card
  sx={{
    borderRadius: 3,
    borderLeft: `4px solid ${urgencyStyle.border}`,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'start',
  }}
>
  <CardContent
    sx={{
      p: { xs: 2.5, md: 3 },
      display: 'flex',
      flexDirection: 'column',
    }}
  >
        {/* Status */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Chip
            label={statusStyle.label}
            size="small"
            sx={{
              fontWeight: 600,
              flexShrink: 0,
              minHeight: 32,
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
            }}
          />
        </Box>

        {/* Category */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '1rem',
            fontWeight: 'bold',
            mb: 1.5,
          }}
        >
          {request.category}
        </Typography>

        {/* Date and Time */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            mb: 1.5,
          }}
        >
          <CalendarMonthOutlinedIcon
            sx={{
              fontSize: 20,
              mt: 0.2,
            }}
            color="action"
          />

          <Box>
            {/* Date */}
            <Typography
              variant="body2"
            
               sx={{
    color: '#166534',
    fontSize: '1rem',
    fontWeight: 700,
    mt: 0.5,
  }}
            >
              Date:{' '}
  <Box
    component="span"
    sx={{ color: '#aa7b23', fontWeight: 700 }}
  >
    {request.scheduledAt
      ? new Date(request.scheduledAt).toLocaleDateString()
      : 'Date not available'}
  </Box>
</Typography>

            {/* Time */}
            <Typography
              variant="body2"
            
               sx={{
    color: '#166534',
    fontSize: '1rem',
    fontWeight: 700,
    mt: 0.5,
  }}
            >
              Time:{' '}
             <Box
    component="span"
    sx={{ color: '#aa7b23ff', fontWeight: 700 }}
  >
    {request.scheduledAt
      ? new Date(request.scheduledAt).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })
      : 'Time not available'}
  </Box>
            </Typography>
          </Box>
        </Box>

        {/* Urgency */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 1.5,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '1rem',
              fontWeight: 700,
            }}
          >
            Urgency:
          </Typography>

          <Chip
            label={request.urgency}
            size="small"
            sx={{
              minHeight: 32,
              fontSize: '0.9rem',
              backgroundColor: urgencyStyle.bg,
              color: urgencyStyle.text,
              fontWeight: 700,
            }}
          />
        </Box>

        {/* View Details Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            mt: 'auto',
            pt: 1,
          }}
        >
          <Button
            onClick={handleToggleDetails}
            sx={{
              minHeight: 44,
              px: 2,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {isExpanded ? 'Hide Details' : 'View Details'}
          </Button>
        </Box>

        {/* Expanded Details */}
        <Collapse
          in={isExpanded}
          timeout="auto"
          unmountOnExit
        >
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid #E2E8F0',
            }}
          >
            {/* Title */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '1rem',
              }}
            >
              <strong>Title:</strong> {request.title}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1.5,
                fontSize: '1rem',
                lineHeight: 1.6,
              }}
            >
              <strong>Description:</strong>{' '}
              {request.description ||
                'No description provided.'}
            </Typography>

            {/* Location */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                mt: 1.5,
              }}
            >
              <LocationOnOutlinedIcon
                sx={{
                  fontSize: 20,
                  mt: 0.2,
                }}
                color="action"
              />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  overflowWrap: 'anywhere',
                }}
              >
                <strong>Location:</strong>{' '}
                {request.address ||
                  'Address not available'}
              </Typography>
            </Box>

            {/* Category */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1.5,
                fontSize: '1rem',
              }}
            >
              <strong>Category:</strong>{' '}
              {request.category}
            </Typography>

            {/* Urgency */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1.5,
                fontSize: '1rem',
              }}
            >
              <strong>Urgency:</strong>{' '}
              {request.urgency}
            </Typography>

            {/* Status */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1.5,
                fontSize: '1rem',
              }}
            >
              <strong>Status:</strong>{' '}
              {statusStyle.label}
            </Typography>

            {/* Volunteer Information */}
            {accepted && request.volunteer && (
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid #E2E8F0',
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{
                    mb: 1.5,
                    fontSize: '1rem',
                  }}
                >
                  Volunteer Details
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: 16,
                    }}
                  >
                    {request.volunteer.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </Avatar>

                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.95rem',
                      }}
                    >
                      Volunteer
                    </Typography>

                    <Typography
                      variant="body1"
                      fontWeight={600}
                      sx={{
                        fontSize: '1rem',
                      }}
                    >
                      {request.volunteer.name ||
                        'Not available'}
                    </Typography>
                  </Box>
                </Box>

                {/* Volunteer Phone */}
                {request.volunteer.phone && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1.5,
                      fontSize: '1rem',
                    }}
                  >
                    <strong>Phone:</strong>{' '}
                    {request.volunteer.phone}
                  </Typography>
                )}

                {/* Volunteer Email */}
                {request.volunteer.email && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      fontSize: '1rem',
                    }}
                  >
                    <strong>Email:</strong>{' '}
                    {request.volunteer.email}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default function RequesterDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('SOONEST');

  const [expandedRequest, setExpandedRequest] =
    useState(null);

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
        console.error(
          'Failed to load dashboard:',
          err
        );

        setError(
          'Unable to load your requests. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleNewRequest = () => {
    navigate('/helpRequest');
  };

  const urgencyRank = {
    HIGH: 0,
    MEDIUM: 1,
    LOW: 2,
  };

  const visibleRequests = useMemo(() => {
    let list = requests;

    if (filter === 'PENDING') {
      list = requests.filter(
        (request) => request.status === 'PENDING'
      );
    }

    if (filter === 'ACCEPTED') {
      list = requests.filter(
        (request) => request.status === 'ACCEPTED'
      );
    }

    const sorted = [...list];

    if (sortBy === 'URGENCY') {
      sorted.sort(
        (a, b) =>
          (urgencyRank[a.urgency] ?? 3) -
          (urgencyRank[b.urgency] ?? 3)
      );
    } else {
      sorted.sort(
        (a, b) =>
          new Date(a.scheduledAt || 0) -
          new Date(b.scheduledAt || 0)
      );
    }

    return sorted;
  }, [requests, filter, sortBy]);

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

  return (
    <Box
      
    >
      {/* Welcome section - centered across the full page */}
      <Box
        sx={{
          width: '100%',
          textAlign: 'center',
          pt: {
            xs: 3,
            md: 4,
          },
          pb: {
            xs: 3,
            md: 4,
          },
          px: 2,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{
            fontSize: {
              xs: '1.75rem',
              md: '2rem',
            },
          }}
        >
          Welcome back, {user?.name || 'User'}! 👋
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: {
              xs: '1rem',
              md: '1.1rem',
            },
          }}
        >
          How can we help you today?
        </Typography>
      </Box>

      {/* Main Content */}
      <Box
        
      >
        {/* Error message */}
        {error && (
          <Typography
            color="error"
            sx={{
              mb: 3,
              fontSize: '1rem',
            }}
          >
            {error}
          </Typography>
        )}

        {/* Filters, sorting, and New Request */}
       <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    mb: 3,
    flexWrap: 'wrap',
  }}
>
          {/* Filter chips */}
          {['ALL', 'PENDING', 'ACCEPTED'].map(
            (key) => (
              <Chip
                key={key}
                
                label={
                  key.charAt(0) +
                  key.slice(1).toLowerCase()
                }
                onClick={() => setFilter(key)}
                sx={{
                  minHeight: 44,
                  px: 1,
                  fontSize: '1rem',
                  fontWeight: 600,
                  backgroundColor:
                    filter === key
                      ? '#1E293B'
                      : 'transparent',
                  color:
                    filter === key
                      ? '#FFFFFF'
                      : 'text.secondary',
                  border:
                    filter === key
                      ? 'none'
                      : '1px solid #E2E8F0',
                  '&:hover': {
                    backgroundColor:
                      filter === key
                        ? '#1E293B'
                        : '#F1F5F9',
                  },
                }}
              />
            )
          )}

          {/* Sorting */}
          <Select
  value={sortBy}
  onChange={(event) =>
    setSortBy(event.target.value)
  }
  sx={{
  
    minWidth: 180,
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    fontSize: '1rem',
  }}
>
            <MenuItem value="SOONEST">
              Sort: soonest
            </MenuItem>

            <MenuItem value="URGENCY">
              Sort: urgency
            </MenuItem>
          </Select>

          {/* New Request */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewRequest}
            sx={{
              minHeight: 40,
              px: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            New Request
          </Button>
        </Box>

        {/* Request list */}
        {visibleRequests.length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{
              fontSize: '1rem',
            }}
          >
            You don't have any{' '}
            {filter !== 'ALL'
              ? filter.toLowerCase()
              : ''}{' '}
            requests.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr',
                lg: 'repeat(3, 1fr)',
              },
              gap: 4,
            }}
          >
            {visibleRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                expandedRequest={expandedRequest}
                setExpandedRequest={
                  setExpandedRequest
                }
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}