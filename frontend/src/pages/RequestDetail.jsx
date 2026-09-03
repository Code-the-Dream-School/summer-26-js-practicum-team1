import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Button,
  Alert,
  Divider,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import Pill from '../components/browse/Pill';
import { useHelpRequest } from '../hooks/useHelpRequests';
import { useRespondToHelpRequest } from '../hooks/useRespondToHelpRequest';
import {
  CATEGORY_BY_API_VALUE,
  URGENCY_BY_API_VALUE,
} from '../utils/browse.constants';
import {
  formatScheduledLabel,
  friendlyDetailErrorMessage,
  formatPostedLabel,
} from '../utils/browse.utils';
import { COLORS } from '../utils/constants';
import LocationMap from '../components/browse/LocationMap';
import RequestTimeline from '../components/browse/RequestTimeline';

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ color: COLORS.textFaint, mt: '2px' }}>{icon}</Box>
      <Box>
        <Typography variant="body2" sx={{ color: COLORS.textFaint }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function RequestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [feedback, setFeedback] = useState(null);

  const { helpRequest, isLoading, isError, error } = useHelpRequest(id);
  const {
    acceptRequest,
    declineRequest,
    completeRequest,
    respondingRequestId,
    isCompleting,
  } = useRespondToHelpRequest();

  const getResponseErrorMessage = (err, fallback) =>
    err?.response?.data?.message || fallback;

  const handleAccept = async () => {
    setFeedback(null);
    try {
      await acceptRequest(id);
      setFeedback({
        severity: 'success',
        message: 'Request accepted. You are now assigned to help.',
      });
    } catch (err) {
      setFeedback({
        severity: 'error',
        message: getResponseErrorMessage(
          err,
          'Could not accept this request. Please try again.'
        ),
      });
    }
  };

  const handleDecline = async () => {
    setFeedback(null);
    try {
      await declineRequest(id);
      setFeedback({ severity: 'info', message: 'Request declined.' });
    } catch (err) {
      setFeedback({
        severity: 'error',
        message: getResponseErrorMessage(
          err,
          'Could not decline this request. Please try again.'
        ),
      });
    }
  };

  const handleComplete = async () => {
    setFeedback(null);
    try {
      await completeRequest(id);
      setFeedback({
        severity: 'success',
        message: 'Request marked as completed.',
      });
    } catch (err) {
      setFeedback({
        severity: 'error',
        message: getResponseErrorMessage(
          err,
          'Could not mark this request as completed. Please try again.'
        ),
      });
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={140} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{
            mb: 2,
            color: 'text.primary',
            textTransform: 'none',
            '& .MuiButton-startIcon': {
              marginTop: '-2px',
            },
          }}
        >
          Back
        </Button>
        <Alert severity="error">{friendlyDetailErrorMessage(error)}</Alert>
      </Box>
    );
  }

  const isResponding = respondingRequestId === Number(id);
  const isCancelled = helpRequest.status === 'CANCELLED';

  const category = CATEGORY_BY_API_VALUE[helpRequest.category];
  const urgency = URGENCY_BY_API_VALUE[helpRequest.urgency];
  const actionsDisabled = !helpRequest.canRespond || isResponding;

  const showAcceptDecline = !isCancelled && helpRequest.canRespond;
  const showComplete =
    !isCancelled &&
    !helpRequest.canRespond &&
    helpRequest.status === 'ACCEPTED' &&
    helpRequest.isAssignedVolunteer;
  const showAlreadyResponded =
    !helpRequest.canRespond &&
    helpRequest.status === 'PENDING' &&
    helpRequest.viewerResponse;
  const showChat = helpRequest.isAssignedVolunteer;

  return (
    <Box>
      <Button
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon />}
        sx={{
          mb: 2,
          color: 'text.primary',
          textTransform: 'none',
          '& .MuiButton-startIcon': {
            marginTop: '-2px',
          },
        }}
      >
        Back
      </Button>

      {feedback && (
        <Alert
          severity={feedback.severity}
          onClose={() => setFeedback(null)}
          sx={{ mb: 2 }}
        >
          {feedback.message}
        </Alert>
      )}

      <Box
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          p: { xs: 3, md: 4 },
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Pill
            label={category?.label.toUpperCase()}
            backgroundColor={COLORS.bgSubtle}
          />
          <Pill
            label={`${urgency?.label.toUpperCase()} URGENCY`}
            backgroundColor={urgency?.color}
            color="#fff"
          />
        </Stack>

        <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
          {helpRequest.title}
        </Typography>

        <Typography variant="body2" sx={{ mt: 0.5, color: COLORS.textFaint }}>
          {formatScheduledLabel(helpRequest.scheduledAt)} ·{' '}
          {formatPostedLabel(helpRequest.createdAt)}
        </Typography>

        <RequestTimeline
          status={helpRequest.status}
          createdAt={helpRequest.createdAt}
          acceptedAt={helpRequest.acceptedAt}
          completedAt={helpRequest.completedAt}
        />

        <Divider sx={{ my: 3 }} />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                display: { xs: 'none', md: 'block' },
                borderColor: COLORS.border,
              }}
            />
          }
          spacing={{ xs: 3, md: 4 }}
        >
          <Box sx={{ flex: 1.4, minWidth: 0, py: { md: 1 } }}>
            {helpRequest.description && (
              <Typography
                variant="body1"
                sx={{ lineHeight: 1.7, color: 'text.primary' }}
              >
                {helpRequest.description}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: { xs: '100%', md: 220 },
              maxWidth: { xs: '100%', md: 260 },
            }}
          >
            <LocationMap
              latitude={helpRequest.latitude}
              longitude={helpRequest.longitude}
              height={160}
            />

            <Stack spacing={2} sx={{ mt: 2 }}>
              <InfoRow
                icon={<PlaceIcon fontSize="small" />}
                label="Location"
                value={helpRequest.address}
              />
              <InfoRow
                icon={<PersonIcon fontSize="small" />}
                label="Requested by"
                value={helpRequest.requester?.name}
              />
              <InfoRow
                icon={<PhoneIcon fontSize="small" />}
                label="Requester phone"
                value={helpRequest.requester?.phone}
              />
              {helpRequest.volunteer && (
                <>
                  <InfoRow
                    icon={<PersonIcon fontSize="small" />}
                    label="Assigned volunteer"
                    value={helpRequest.volunteer.name}
                  />
                  <InfoRow
                    icon={<PhoneIcon fontSize="small" />}
                    label="Volunteer phone"
                    value={helpRequest.volunteer.phone}
                  />
                </>
              )}
            </Stack>
          </Box>
        </Stack>

        {(showAcceptDecline ||
          showComplete ||
          showAlreadyResponded ||
          showChat) && (
          <>
            <Divider sx={{ my: 3, borderColor: COLORS.border }} />

            {showAcceptDecline && (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ justifyContent: 'flex-end' }}
              >
                <Button
                  variant="outlined"
                  disabled={actionsDisabled}
                  onClick={handleDecline}
                  sx={{
                    textTransform: 'none',
                    borderColor: COLORS.border,
                    color: COLORS.textMuted,
                    backgroundColor: '#fff',
                    '&:hover': {
                      borderColor: COLORS.borderHover,
                      backgroundColor: COLORS.sage,
                    },
                  }}
                >
                  {isResponding ? 'Saving…' : 'Decline'}
                </Button>
                <Button
                  variant="contained"
                  disabled={actionsDisabled}
                  onClick={handleAccept}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: COLORS.forest,
                    '&:hover': { backgroundColor: COLORS.primaryHover },
                  }}
                >
                  {isResponding ? 'Saving…' : 'I can help'}
                </Button>
              </Stack>
            )}

            {(showChat || showComplete) && (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ justifyContent: 'flex-end' }}
              >
                {showChat && (
                  <Button
                    component={RouterLink}
                    to={`/chat/${id}`}
                    variant="outlined"
                    startIcon={<ChatIcon />}
                    sx={{
                      textTransform: 'none',
                      borderColor: COLORS.border,
                      color: COLORS.forest,
                      '&:hover': {
                        borderColor: COLORS.borderHover,
                        backgroundColor: COLORS.sage,
                      },
                    }}
                  >
                    Message{' '}
                    {helpRequest.requester?.name?.split(' ')[0] || 'requester'}
                  </Button>
                )}

                {showComplete && (
                  <Button
                    variant="contained"
                    disabled={isCompleting}
                    onClick={handleComplete}
                    sx={{
                      textTransform: 'none',
                      backgroundColor: COLORS.forest,
                      '&:hover': { backgroundColor: COLORS.primaryHover },
                    }}
                  >
                    {isCompleting ? 'Saving…' : 'Mark as completed'}
                  </Button>
                )}
              </Stack>
            )}

            {showAlreadyResponded && (
              <Typography
                variant="body2"
                sx={{ color: COLORS.textFaint, textAlign: 'right' }}
              >
                You already{' '}
                {helpRequest.viewerResponse === 'ACCEPTED'
                  ? 'accepted'
                  : 'declined'}{' '}
                this request.
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default RequestDetail;
