import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Typography,
  IconButton,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';

import { useAcceptedVolunteerProfile } from '../../hooks/useHelpRequests';

import {
  getUrgencyStyle,
  getStatusStyle,
} from '../../utils/requester.constants.js';

import { CATEGORY_BY_API_VALUE } from '../../utils/browse.constants.js';

import { COLORS } from '../../utils/constants.js';

function RequestCard({
  request,
  onEdit,
  onCancel,
  onVolunteerProfile,
  unreadCount,
  dashboardType,
  userRole,
}) {
  const navigate = useNavigate();

  const requestStatus = String(request.status || '').toUpperCase();

  const isPending = requestStatus === 'PENDING';

  const canChat = requestStatus === 'ACCEPTED' || requestStatus === 'COMPLETED';

  const showVolunteer =
    dashboardType === 'requester' &&
    (requestStatus === 'ACCEPTED' || requestStatus === 'COMPLETED');

  const urgencyStyle = getUrgencyStyle(request.urgency);
  const statusStyle = getStatusStyle(requestStatus);

  const { volunteer } = useAcceptedVolunteerProfile(request.id, showVolunteer);

  // Navigate to the request details page
  const handleToggleDetails = () => {
    navigate(`/requests/${request.id}`);
  };

  //chat helper
  const handleOpenChat = () => {
    navigate(`/chat/${request.id}`, {
      state: {
        participantId:
          userRole === 'VOLUNTEER' ? request.requesterId : request.volunteerId,
      },
    });
  };

  const handleEditClick = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    onEdit(request);
  };

  const handleCancelClick = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    onCancel(request);
  };

  const handleVolunteerProfile = () => {
    if (volunteer && onVolunteerProfile) {
      onVolunteerProfile(volunteer);
    }
  };
  const participantName =
    userRole === 'VOLUNTEER'
      ? request.requester?.name
      : request.volunteer?.name;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        boxShadow: 3,
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2.5,
            md: 3,
          },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* TITLE + EDIT/CANCEL + STATUS */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
          }}
        >
          {/* TITLE */}

          <Typography
            variant="h6"
            sx={{
              color: COLORS.text,
              fontWeight: 800,
              mb: 0,
              flex: 1,
            }}
          >
            {request.title}
          </Typography>

          {/* EDIT + CANCEL + STATUS */}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
            }}
          >
            {/* EDIT + CANCEL ONLY FOR PENDING */}

            {dashboardType === 'requester' && isPending && (
              <>
                {/* EDIT */}

                <Tooltip title="Edit request">
                  <IconButton
                    onClick={handleEditClick}
                    aria-label="Edit help request"
                    size="small"
                    sx={{
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      color: COLORS.primary,
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: COLORS.bgSubtle,
                      },
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* CANCEL */}

                <Tooltip title="Cancel request">
                  <IconButton
                    onClick={handleCancelClick}
                    aria-label="Cancel help request"
                    size="small"
                    sx={{
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      color: COLORS.primary,
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: COLORS.bgSubtle,
                      },
                    }}
                  >
                    <DeleteForeverOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {/* STATUS */}

            <Chip
              label={statusStyle.label}
              size="small"
              sx={{
                fontWeight: 500,
                flexShrink: 0,
                minHeight: 32,
                backgroundColor: statusStyle.bg,
                color: statusStyle.text,
              }}
            />
          </Box>
        </Box>

        {/* CATEGORY */}

        <Typography
          variant="body2"
          sx={{
            color: COLORS.textMuted,
            fontSize: '1rem',
            fontWeight: 700,
            mb: 1.5,
          }}
        >
          {CATEGORY_BY_API_VALUE[request.category]?.label || request.category}
        </Typography>

        {/* DATE + TIME */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexWrap: 'wrap',
            mb: 1.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: COLORS.primary,
              fontSize: '1rem',
              fontWeight: 700,
            }}
          >
            Date:{' '}
            <Box
              component="span"
              sx={{
                color: '#AA7B23',
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
              color: COLORS.primary,
              fontSize: '1rem',
              fontWeight: 700,
            }}
          >
            Time:{' '}
            <Box
              component="span"
              sx={{
                color: '#AA7B23',
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

        {/* URGENCY */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mt: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: COLORS.textMuted,
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

        {/* VOLUNTEER + ACTIONS */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mt: 2,
            width: '100%',
            flexWrap: 'wrap',
          }}
        >
          {/* VOLUNTEER PROFILE - REQUESTER ONLY */}

          {showVolunteer && volunteer && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mr: 'auto',
              }}
            >
              <Avatar
                src={volunteer.profileImage || undefined}
                alt={volunteer.name || 'Volunteer'}
                onClick={handleVolunteerProfile}
                sx={{
                  width: 42,
                  height: 42,
                  cursor: 'pointer',
                  bgcolor: '#E8F5E9',
                  color: '#166534',
                  fontWeight: 700,
                  '&:hover': {
                    boxShadow: '0 0 0 3px #DCFCE7',
                  },
                }}
              >
                {!volunteer.profileImage &&
                  volunteer.name?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: COLORS.textMuted,
                    fontSize: '0.8rem',
                  }}
                >
                  Volunteer
                </Typography>

                <Typography
                  variant="body1"
                  fontWeight={600}
                  onClick={handleVolunteerProfile}
                  sx={{
                    color: COLORS.primary,
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {volunteer.name || 'Not available'}
                </Typography>
              </Box>
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
              marginLeft: 'auto',
            }}
          >
            {/* MESSAGE BUTTON */}

            {canChat && (
              <Button
                variant="contained"
                startIcon={<ChatBubbleIcon />}
                onClick={handleOpenChat}
                sx={{
                  minHeight: 42,
                  width: 150,
                  px: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Message
                {participantName || 'User'}
                {unreadCount > 0 && (
                  <Chip
                    label={unreadCount}
                    size="small"
                    sx={{
                      ml: 1,
                      height: 20,
                      minWidth: 20,
                      backgroundColor: 'error.main',
                      color: 'white',
                      fontWeight: 700,
                      '& .MuiChip-label': {
                        px: 0.75,
                      },
                    }}
                  />
                )}
              </Button>
            )}

            {/* VIEW DETAILS */}

            <Button
              onClick={handleToggleDetails}
              sx={{
                minHeight: 44,
                px: 2,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                color: COLORS.primary,
              }}
            >
              View Details
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default RequestCard;
