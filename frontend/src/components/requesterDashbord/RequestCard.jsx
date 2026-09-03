
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Tooltip,
  Typography,
  IconButton,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
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
  expandedRequest,
  onEdit,
  onCancel,
  onVolunteerProfile,
  unreadCount,
}) {
  const navigate = useNavigate();

  const requestStatus = String(request.status || '').toUpperCase();

  const accepted = requestStatus === 'ACCEPTED';

  const isPending = requestStatus === 'PENDING';

  const canChat =
    requestStatus === 'ACCEPTED' || requestStatus === 'COMPLETED';

  const urgencyStyle = getUrgencyStyle(request.urgency);

  const statusStyle = getStatusStyle(requestStatus);

  const isExpanded = Number(expandedRequest) === Number(request.id);

  const { volunteer } = useAcceptedVolunteerProfile(request.id, accepted);

  const blurActiveElement = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // Navigate to the request details page
  const handleToggleDetails = () => {
    // navigate(`/requests/${request.id}`);
  };

  const handleOpenChat = () => {
    navigate(`/chat/${request.id}`, {
      state: {
        participantId: request.volunteerId,
      },
    });
  };

  const handleEditClick = () => {
    blurActiveElement();
    onEdit(request);
  };

  const handleCancelClick = () => {
    blurActiveElement();
    onCancel(request);
  };

  return (
    <Card
      id={`request-card-${request.id}`}
      sx={{
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        boxShadow: 'none',
        '&:hover': {
          borderColor: COLORS.borderHover,
        },
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

            {isPending && (
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

        {/* URGENCY + ACTIONS */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mt: 1,
            flexWrap: 'wrap',
          }}
        >
          {/* URGENCY - LEFT */}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
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

          {/* ACTIONS - RIGHT */}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
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
                  px: 2.5,
                  borderRadius: 2,
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
              </Button>
            )}

            {/* VIEW DETAILS BUTTON */}

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
              {volunteer.name || 'Volunteer'}

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
              {isExpanded ? 'Hide Details' : 'View Details'}
            </Button>
          </Box>
        </Box>

        {/* EXPANDED DETAILS */}

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            {/* DESCRIPTION */}

            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                color: COLORS.textMuted,
                fontSize: '1rem',
                lineHeight: 1.6,
              }}
            >
              <strong>Description:</strong>{' '}
              {request.description || 'No description provided.'}
            </Typography>

            {/* LOCATION */}

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
                sx={{
                  color: COLORS.textMuted,
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  overflowWrap: 'anywhere',
                }}
              >
                <strong>Location:</strong>{' '}
                {request.address || 'Address not available'}
              </Typography>
            </Box>

            {/* CATEGORY */}

            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                color: COLORS.textMuted,
                fontSize: '1rem',
              }}
            >
              <strong>Category:</strong> {request.category}
            </Typography>

            {/* URGENCY */}

            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                color: COLORS.textMuted,
                fontSize: '1rem',
              }}
            >
              <strong>Urgency:</strong> {request.urgency}
            </Typography>

            {/* STATUS */}

            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                color: COLORS.textMuted,
                fontSize: '1rem',
              }}
            >
              <strong>Status:</strong> {statusStyle.label}
            </Typography>

            {/* VOLUNTEER */}

            {accepted && volunteer && (
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: `1px solid ${COLORS.border}`,
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
                  {/* AVATAR */}

                  <Avatar
                    src={volunteer.profileImage || undefined}
                    alt={volunteer.name || 'Volunteer'}
                    onClick={() => onVolunteerProfile(volunteer)}
                    sx={{
                      width: 48,
                      height: 48,
                      fontSize: 18,
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
                      onClick={() => onVolunteerProfile(volunteer)}
                      sx={{
                        fontSize: '1rem',
                        cursor: 'pointer',
                        color: COLORS.primary,

                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {volunteer.name || 'Not available'}
                    </Typography>
                  </Box>
                </Box>

                {/* PHONE */}

                {volunteer.phone && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1.5,
                      fontSize: '1rem',
                    }}
                  >
                    <strong>Phone:</strong> {volunteer.phone}
                  </Typography>
                )}

                {/* EMAIL */}

                {volunteer.email && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      fontSize: '1rem',
                    }}
                  >
                    <strong>Email:</strong> {volunteer.email}
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

export default RequestCard;

