import { Box, Skeleton, Stack } from '@mui/material';
import {
  CATEGORIES,
  URGENCY_LEVELS,
  DAYS_OF_WEEK,
} from '../../utils/browse.constants';
import { COLORS } from '../../utils/constants';

function FilterSidebarSkeleton() {
  return (
    <Box
      sx={{
        backgroundColor: COLORS.bgSubtle,
        border: '1px solid',
        borderColor: COLORS.border,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Skeleton variant="text" width={60} height={28} />

      <Skeleton variant="text" width={80} height={28} sx={{ mt: 2, mb: 1 }} />

      <Box>
        {CATEGORIES.map((cat) => (
          <Stack
            key={cat.key}
            direction="row"
            sx={{
              p: 0.5,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center' }} spacing={0.5}>
              <Skeleton variant="rounded" width={18} height={18} />
              <Skeleton variant="text" width={70} height={22} />
            </Stack>

            <Skeleton variant="text" width={18} height={22} />
          </Stack>
        ))}
      </Box>

      <Skeleton variant="text" width={70} height={28} sx={{ mt: 3, mb: 1 }} />

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {URGENCY_LEVELS.map((level) => (
          <Skeleton
            key={level.key}
            variant="rounded"
            width={75}
            height={32}
            sx={{ borderRadius: 5 }}
          />
        ))}
      </Stack>

      <Skeleton variant="text" width={70} height={28} sx={{ mt: 3, mb: 1 }} />

      <Box sx={{ px: 0.5 }}>
        <Skeleton variant="rounded" width="100%" height={24} />

        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Skeleton variant="text" width={45} height={22} />
          <Skeleton variant="text" width={65} height={22} />
        </Stack>
      </Box>

      <Skeleton variant="text" width={95} height={28} sx={{ mt: 3, mb: 1 }} />

      <Stack
        direction="row"
        sx={{ justifyContent: 'space-evenly' }}
        spacing={0.5}
      >
        {DAYS_OF_WEEK.map(({ day }) => (
          <Skeleton key={day} variant="circular" width={28} height={28} />
        ))}
      </Stack>

      <Skeleton variant="text" width="100%" height={36} sx={{ mt: 0.5 }} />

      <Skeleton variant="rounded" width="100%" height={36} sx={{ mt: 3 }} />
    </Box>
  );
}

export default FilterSidebarSkeleton;
