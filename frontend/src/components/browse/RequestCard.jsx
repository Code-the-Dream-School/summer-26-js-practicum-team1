import { Box, Stack, Typography, Button } from '@mui/material';
import Pill from './Pill';
import {
  CATEGORY_BY_API_VALUE,
  URGENCY_BY_API_VALUE,
} from '../../utils/browse.constants';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { formatScheduledLabel } from '../../utils/browse.utils';
import { COLORS } from '../../utils/constants';

function formatPostedLabel(createdAt) {
  if (!createdAt) return '';
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 1) return 'Posted just now';
  if (hours < 24) return `Posted ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Posted yesterday';
  return `Posted ${days} days ago`;
}

function RequestCard({
  request,
  isDeclined = false,
  isResponding = false,
  onAccept,
  onDecline,
}) {
  const category = CATEGORY_BY_API_VALUE[request.category];
  const urgency = URGENCY_BY_API_VALUE[request.urgency];
  const actionsDisabled = isDeclined || isResponding;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: COLORS.border,
        borderRadius: 2,
        p: 2.5,
        mb: 2,
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Pill
            label={(category?.label || request.category).toUpperCase()}
            backgroundColor={COLORS.bgSubtle}
            color={COLORS.textMuted}
          />
          <Pill
            label={`${(urgency?.label || request.urgency)?.toUpperCase()} URGENCY`}
            backgroundColor={urgency?.color || COLORS.textFaint}
            color="#fff"
          />
          {isDeclined && (
            <Pill
              label="DECLINED"
              backgroundColor="#F5F0E8"
              color={COLORS.textMuted}
            />
          )}
        </Stack>

        {request.distanceMi != null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RadioButtonCheckedIcon
              sx={{
                fontSize: 16,
                color: COLORS.textFaint,
                transform: 'translateY(-1px)',
              }}
            />
            <Typography variant="body2" sx={{ color: COLORS.textFaint }}>
              {request.distanceMi.toFixed(1)} mi away
            </Typography>
          </Box>
        )}
      </Stack>

      <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 600 }}>
        {request.title}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, color: COLORS.textMuted }}>
        {request.description}
      </Typography>

      <Stack
        direction="row"
        sx={{ mt: 2, justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="body2" sx={{ color: COLORS.textFaint }}>
          {formatScheduledLabel(request.scheduledAt)} ·{' '}
          {formatPostedLabel(request.createdAt)}
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            disabled={actionsDisabled}
            sx={{
              textTransform: 'none',
              borderColor: COLORS.border,
              color: 'text.primary',
              '&:hover': {
                borderColor: COLORS.borderHover,
                backgroundColor: COLORS.bgSubtle,
              },
            }}
          >
            View details
          </Button>
          <Button
            variant="outlined"
            disabled={actionsDisabled}
            onClick={onDecline}
            sx={{
              textTransform: 'none',
              borderColor: COLORS.border,
              color: COLORS.textMuted,
              '&:hover': {
                borderColor: COLORS.borderHover,
                backgroundColor: COLORS.bgSubtle,
              },
            }}
          >
            {isResponding ? 'Saving…' : 'Decline'}
          </Button>
          <Button
            variant="contained"
            disabled={actionsDisabled}
            onClick={onAccept}
            sx={{
              textTransform: 'none',
              backgroundColor: COLORS.primary,
              '&:hover': { backgroundColor: COLORS.primaryHover },
            }}
          >
            {isResponding ? 'Saving…' : 'I can help'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default RequestCard;
