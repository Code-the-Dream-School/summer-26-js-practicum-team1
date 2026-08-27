import { Box, Stack, Typography } from '@mui/material';
import Pill from './Pill';
import {
  CATEGORY_BY_API_VALUE,
  URGENCY_BY_API_VALUE,
  COLORS,
} from '../../utils/browse.constants';
import { formatScheduledLabel } from '../../utils/browse.utils';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

function MapPopupCard({ request }) {
  const category = CATEGORY_BY_API_VALUE[request.category];
  const urgency = URGENCY_BY_API_VALUE[request.urgency];

  return (
    <Box sx={{ minWidth: 220, maxWidth: 260, p: 0.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
        <Pill
          label={(category?.label || request.category).toUpperCase()}
          backgroundColor={COLORS.bgSubtle}
          color={COLORS.textMuted}
        />
        <Pill
          label={(urgency?.label || request.urgency)?.toUpperCase()}
          backgroundColor={urgency?.color || COLORS.textFaint}
          color="#fff"
        />
      </Stack>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {request.title}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: COLORS.textFaint,
          mt: 0.5,
        }}
      >
        {formatScheduledLabel(request.scheduledAt)}
      </Typography>

      {request.distanceMi != null && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mt: 0.5 }}>
          <RadioButtonCheckedIcon
            sx={{ fontSize: 14, color: COLORS.textFaint }}
          />
          <Typography variant="caption" sx={{ color: COLORS.textFaint }}>
            {request.distanceMi.toFixed(1)} mi away
          </Typography>
        </Box>
      )}

      <Typography
        variant="caption"
        sx={{ display: 'block', color: COLORS.textFaint, mt: 0.75, fontStyle: 'italic' }}
      >
        Click pin for details
      </Typography>
    </Box>
  );
}

export default MapPopupCard;