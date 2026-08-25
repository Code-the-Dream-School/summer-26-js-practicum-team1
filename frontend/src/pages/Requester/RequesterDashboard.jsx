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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';

import {
  getMe,
  getHelpRequests,
  getHelpRequestById,
  updateHelpRequest,
  cancelHelpRequest,
} from '../../services/api';

import { useAcceptedVolunteerProfile } from '../../hooks/useAcceptedVolunteerProfile';

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

const CATEGORY_OPTIONS = [
  'GROCERY',
  'TRANSPORTATION',
  'HOUSEHOLD_CHORES',
  'YARD_WORK',
  'PET_CARE',
  'TECH_SUPPORT',
  'COMPANIONSHIP',
  'MEAL_PREP',
  'MEDICAL_ERRAND',
  'OTHER',
];

const URGENCY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

function getUrgencyStyle(urgency) {
  return URGENCY_STYLES[urgency] || URGENCY_STYLES.LOW;
}

function getStatusStyle(status) {
  return STATUS_STYLES[status] || STATUS_STYLES.PENDING;
}

function formatDateTimeLocal(dateValue) {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/* 
   REQUEST CARD
 */

function RequestCard({
  request,
  expandedRequest,
  setExpandedRequest,
  onEdit,
  onCancel,
  onVolunteerProfile,
}) {
  const accepted = request.status === 'ACCEPTED';
  const isPending = request.status === 'PENDING';

  const urgencyStyle = getUrgencyStyle(request.urgency);
  const statusStyle = getStatusStyle(request.status);

  const isExpanded = expandedRequest === request.id;

  const { volunteer } = useAcceptedVolunteerProfile(
    request.id,
    accepted
  );

  const handleToggleDetails = () => {
    setExpandedRequest(isExpanded ? null : request.id);
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
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
              fontWeight: 400,
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
    alignItems: 'center',
    gap: 3,
  }}
>
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
      sx={{
        color: '#aa7b23',
        fontWeight: 700,
      }}
    >
      {request.scheduledAt
        ? new Date(request.scheduledAt).toLocaleDateString()
        : 'Date not available'}
    </Box>
  </Typography>

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
      sx={{
        color: '#aa7b23',
        fontWeight: 700,
      }}
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

        {/* View Details + Edit + Cancel */}
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

          {isPending && (
            <>
              <Tooltip title="Edit request">
                <IconButton
                  onClick={() => onEdit(request)}
                  aria-label="Edit help request"
                  size="small"
                  sx={{
                    color: '#318ce7ff',
                    '&:hover': {
                      backgroundColor: '#DCFCE7',
                    },
                  }}
                >
                  <EditOutlinedIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Cancel request">
                <IconButton
                  onClick={() => onCancel(request)}
                  aria-label="Cancel help request"
                  size="small"
                  sx={{
                    color: '#991B1B',
                    '&:hover': {
                      backgroundColor: '#FEE2E2',
                    },
                  }}
                >
                  <DeleteForeverOutlinedIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
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
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '1rem',
              }}
            >
              <strong>Title:</strong> {request.title}
            </Typography>

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

            {/* Volunteer */}
            {accepted && volunteer && (
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
                  {/* CLICKABLE AVATAR */}
                  <Avatar
                    onClick={() =>
                      onVolunteerProfile(volunteer)
                    }
                    sx={{
                      width: 48,
                      height: 48,
                      fontSize: 18,
                      cursor: 'pointer',
                      bgcolor: '#E8F5E9',
                      color: '#166534',
                      fontWeight: 700,
                      '&:hover': {
                        boxShadow:
                          '0 0 0 3px #DCFCE7',
                      },
                    }}
                  >
                    {volunteer.name
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

                    {/* CLICKABLE NAME */}
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      onClick={() =>
                        onVolunteerProfile(volunteer)
                      }
                      sx={{
                        fontSize: '1rem',
                        cursor: 'pointer',
                        color: '#166534',
                        '&:hover': {
                          textDecoration:
                            'underline',
                        },
                      }}
                    >
                      {volunteer.name ||
                        'Not available'}
                    </Typography>
                  </Box>
                </Box>

                {volunteer.phone && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1.5,
                      fontSize: '1rem',
                    }}
                  >
                    <strong>Phone:</strong>{' '}
                    {volunteer.phone}
                  </Typography>
                )}

                {volunteer.email && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      fontSize: '1rem',
                    }}
                  >
                    <strong>Email:</strong>{' '}
                    {volunteer.email}
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

/*
   REQUESTER DASHBOARD
*/

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

 
  // VOLUNTEER PROFILE DIALOG STATE
  
  const [volunteerDialogOpen, setVolunteerDialogOpen] =
    useState(false);

  const [selectedVolunteer, setSelectedVolunteer] =
    useState(null);

 
  // EDIT STATE
  
  const [editRequest, setEditRequest] =
    useState(null);

  const [editLoading, setEditLoading] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [editError, setEditError] =
    useState('');

  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    urgency: '',
    scheduledAt: '',
    address: '',
    latitude: '',
    longitude: '',
    description: '',
  });

  
  // CANCEL STATE
  
  const [cancelRequest, setCancelRequest] =
    useState(null);

  const [cancelling, setCancelling] =
    useState(false);

  
  // LOAD DASHBOARD
 
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

        const response =
          await getHelpRequests();

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

  
  // NEW REQUEST
  
  const handleNewRequest = () => {
    navigate('/helpRequest');
  };

 
  // VOLUNTEER PROFILE
  

  const handleVolunteerProfile = (volunteer) => {
    if (!volunteer) {
      return;
    }

    setSelectedVolunteer(volunteer);
    setVolunteerDialogOpen(true);
  };

  const handleCloseVolunteerDialog = () => {
    setVolunteerDialogOpen(false);
    setSelectedVolunteer(null);
  };

  
  // EDIT REQUEST
  
  const handleEdit = async (request) => {
    try {
      setEditError('');
      setEditLoading(true);

      const currentRequest =
        await getHelpRequestById(request.id);

      setEditRequest(currentRequest);

      setEditForm({
        title: currentRequest.title || '',
        category:
          currentRequest.category || '',
        urgency:
          currentRequest.urgency || '',
        scheduledAt: formatDateTimeLocal(
          currentRequest.scheduledAt
        ),
        address:
          currentRequest.address || '',
        latitude:
          currentRequest.latitude !== null &&
          currentRequest.latitude !== undefined
            ? String(currentRequest.latitude)
            : '',
        longitude:
          currentRequest.longitude !== null &&
          currentRequest.longitude !== undefined
            ? String(currentRequest.longitude)
            : '',
        description:
          currentRequest.description || '',
      });
    } catch (err) {
      console.error(
        'Failed to load request for editing:',
        err
      );

      setEditError(
        'Unable to load this request for editing.'
      );
    } finally {
      setEditLoading(false);
    }
  };

  
  // CLOSE EDIT DIALOG
 
  const handleCloseEditDialog = () => {
    if (!updating) {
      setEditRequest(null);
      setEditError('');
    }
  };

  
  // EDIT FIELD CHANGE
  

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

 
  // UPDATE REQUEST
  
  const handleUpdateRequest = async () => {
    if (!editRequest) {
      return;
    }

    try {
      setUpdating(true);
      setEditError('');
      setError('');

      const updatedData = {
        title: editForm.title.trim(),
        category: editForm.category,
        urgency: editForm.urgency,
        scheduledAt: new Date(
          editForm.scheduledAt
        ).toISOString(),
        address: editForm.address.trim(),
        latitude: Number(editForm.latitude),
        longitude: Number(
          editForm.longitude
        ),
        description:
          editForm.description.trim(),
      };

      const csrfToken = user?.csrfToken;

      if (!csrfToken) {
        setEditError(
          'CSRF token is missing. Please refresh the page and try again.'
        );
        return;
      }

      const updatedRequest =
        await updateHelpRequest(
          editRequest.id,
          updatedData,
          csrfToken
        );

      console.log(
        'Updated request response:',
        updatedRequest
      );

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === editRequest.id
            ? {
                ...request,
                ...(updatedRequest?.data ||
                  updatedRequest),
              }
            : request
        )
      );

      setEditRequest(null);
    } catch (err) {
      console.error(
        'Failed to update request:',
        err
      );

      console.error(
        'Status:',
        err?.response?.status
      );

      console.error(
        'Server response:',
        err?.response?.data
      );

      setEditError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Unable to update this request. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

 
  // OPEN CANCEL DIALOG
  
  const handleCancel = (request) => {
    setCancelRequest(request);
  };

  
  // CLOSE CANCEL DIALOG
  
  const handleCloseCancelDialog = () => {
    if (!cancelling) {
      setCancelRequest(null);
    }
  };

  // -------------------------------
  // CONFIRM CANCEL
  // -------------------------------

  const handleConfirmCancel = async () => {
    if (!cancelRequest) {
      return;
    }

    try {
      setCancelling(true);
      setError('');

      const csrfToken = user?.csrfToken;

      await cancelHelpRequest(
        cancelRequest.id,
        csrfToken
      );

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === cancelRequest.id
            ? {
                ...request,
                status: 'CANCELLED',
              }
            : request
        )
      );

      setCancelRequest(null);
    } catch (err) {
      console.error(
        'Failed to cancel request:',
        err
      );

      setError(
        'Unable to cancel this request. Please try again.'
      );
    } finally {
      setCancelling(false);
    }
  };

 
  // FILTER + SORT
 

  const urgencyRank = {
    HIGH: 0,
    MEDIUM: 1,
    LOW: 2,
  };

  const visibleRequests = useMemo(() => {
    let list = requests;

    if (filter === 'PENDING') {
      list = requests.filter(
        (request) =>
          request.status === 'PENDING'
      );
    }

    if (filter === 'ACCEPTED') {
      list = requests.filter(
        (request) =>
          request.status === 'ACCEPTED'
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
    <Box>
      {/* Welcome section */}

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
          Welcome back, {user?.name || 'User'}!
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

      <Box>
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

        {/* Filters */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          {['ALL', 'PENDING', 'ACCEPTED'].map(
            (key) => (
              <Chip
                key={key}
                label={
                  key.charAt(0) +
                  key.slice(1).toLowerCase()
                }
                onClick={() =>
                  setFilter(key)
                }
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
                lg: 'repeat(1, 1fr)',
              },
              gap: 3,
            }}
          >
            {visibleRequests.map(
              (request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  expandedRequest={
                    expandedRequest
                  }
                  setExpandedRequest={
                    setExpandedRequest
                  }
                  onEdit={handleEdit}
                  onCancel={handleCancel}
                  onVolunteerProfile={
                    handleVolunteerProfile
                  }
                />
              )
            )}
          </Box>
        )}
      </Box>

      {/*   VOLUNTEER PROFILE DIALOG */}

      <Dialog
  open={volunteerDialogOpen}
  onClose={handleCloseVolunteerDialog}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle
    sx={{
      fontWeight: 700,
      fontSize: '1.5rem',
      color: '#52462A',
    }}
  >
    Volunteer Profile
  </DialogTitle>

  <DialogContent dividers>
    {selectedVolunteer ? (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2,
        }}
      >
        {/* Profile Image */}
        <Avatar
          src={selectedVolunteer.profileImage || undefined}
          alt={selectedVolunteer.name || 'Volunteer'}
          sx={{
            width: 110,
            height: 110,
            mb: 2,
            fontSize: '2.5rem',
            bgcolor: '#E8F5E9',
            color: '#166534',
            fontWeight: 700,
          }}
        >
          {!selectedVolunteer.profileImage &&
            selectedVolunteer.name
              ?.charAt(0)
              ?.toUpperCase()}
        </Avatar>

        {/* Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#166534',
            mb: 3,
          }}
        >
          {selectedVolunteer.name || 'Name not available'}
        </Typography>

        {/* Profile Information */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Email */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              Email
            </Typography>

            <Typography variant="body1">
              {selectedVolunteer.email ||
                'Not available'}
            </Typography>
          </Box>

          {/* Phone */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              Phone
            </Typography>

            <Typography variant="body1">
              {selectedVolunteer.phone ||
                'Not available'}
            </Typography>
          </Box>

          {/* Bio */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              About
            </Typography>

            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.6,
              }}
            >
              {selectedVolunteer.volunteerProfile?.bio ||
                'No bio available'}
            </Typography>
          </Box>

          {/* Service Area */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              Service Area
            </Typography>

            <Typography variant="body1">
              {selectedVolunteer.volunteerProfile
                ?.serviceArea || 'Not available'}
            </Typography>
          </Box>

          {/* Availability */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              Availability
            </Typography>

            <Typography variant="body1">
              {selectedVolunteer.volunteerProfile
                ?.availability || 'Not available'}
            </Typography>
          </Box>

          {/* Interests */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              Interests
            </Typography>

            <Typography variant="body1">
              {Array.isArray(
                selectedVolunteer.volunteerProfile
                  ?.interests
              )
                ? selectedVolunteer.volunteerProfile.interests.join(
                    ', '
                  )
                : selectedVolunteer.volunteerProfile
                    ?.interests ||
                  'Not available'}
            </Typography>
          </Box>
        </Box>
      </Box>
    ) : (
      <Typography color="text.secondary">
        Volunteer information is not available.
      </Typography>
    )}
  </DialogContent>

  <DialogActions sx={{ p: 2 }}>
    <Button
      onClick={handleCloseVolunteerDialog}
      sx={{
        textTransform: 'none',
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>
      {/*   EDIT  */}

      <Dialog
        open={Boolean(editRequest)}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
          }}
        >
          Edit Help Request
        </DialogTitle>

        <DialogContent dividers>
          {editLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 5,
              }}
            >
              <CircularProgress color="success" />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                pt: 1,
              }}
            >
              {editError && (
                <Typography
                  color="error"
                  sx={{
                    fontSize: '0.95rem',
                  }}
                >
                  {editError}
                </Typography>
              )}

              <TextField
                label="Title"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                fullWidth
                required
              />

              <TextField
                select
                label="Category"
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                fullWidth
                required
              >
                {CATEGORY_OPTIONS.map(
                  (category) => (
                    <MenuItem
                      key={category}
                      value={category}
                    >
                      {category}
                    </MenuItem>
                  )
                )}
              </TextField>

              <TextField
                select
                label="Urgency"
                name="urgency"
                value={editForm.urgency}
                onChange={handleEditChange}
                fullWidth
                required
              >
                {URGENCY_OPTIONS.map(
                  (urgency) => (
                    <MenuItem
                      key={urgency}
                      value={urgency}
                    >
                      {urgency}
                    </MenuItem>
                  )
                )}
              </TextField>

              <TextField
                label="Date & Time"
                name="scheduledAt"
                type="datetime-local"
                value={
                  editForm.scheduledAt
                }
                onChange={handleEditChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="Address"
                name="address"
                value={editForm.address}
                onChange={handleEditChange}
                fullWidth
                required
              />

              <TextField
                label="Description"
                name="description"
                value={
                  editForm.description
                }
                onChange={handleEditChange}
                fullWidth
                multiline
                minRows={4}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={
              handleCloseEditDialog
            }
            disabled={updating}
            sx={{
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={
              handleUpdateRequest
            }
            variant="contained"
            disabled={
              editLoading ||
              updating ||
              !editRequest
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {updating
              ? 'Updating...'
              : 'Update Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          CANCEL REQUEST DIALOG
      ===================================================== */}

      <Dialog
        open={Boolean(cancelRequest)}
        onClose={
          handleCloseCancelDialog
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Cancel Help Request?
        </DialogTitle>

        <DialogContent>
          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Are you sure you want to cancel
            this help request?
          </Typography>

          {cancelRequest && (
            <Typography
              fontWeight={600}
              sx={{ mt: 2 }}
            >
              {cancelRequest.title}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={
              handleCloseCancelDialog
            }
            disabled={cancelling}
            sx={{
              textTransform: 'none',
            }}
          >
            Keep Request
          </Button>

          <Button
            onClick={
              handleConfirmCancel
            }
            disabled={cancelling}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
            }}
          >
            {cancelling
              ? 'Cancelling...'
              : 'Cancel Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}