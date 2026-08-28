import { Box, Stack, Skeleton } from '@mui/material';
import { COLORS } from '../../utils/constants';

function RequestCardSkeleton() {
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
        <Stack direction="row" spacing={1}>
          <Skeleton
            variant="rounded"
            width={90}
            height={22}
            sx={{ borderRadius: 5 }}
          />
          <Skeleton
            variant="rounded"
            width={110}
            height={22}
            sx={{ borderRadius: 5 }}
          />
        </Stack>
        <Skeleton variant="text" width={70} />
      </Stack>

      <Skeleton variant="text" width="55%" height={32} sx={{ mt: 1.5 }} />
      <Skeleton variant="text" width="95%" />
      <Skeleton variant="text" width="75%" />

      <Stack
        direction="row"
        sx={{ mt: 2, justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Skeleton variant="text" width={170} />
        <Stack direction="row" spacing={1.5}>
          <Skeleton
            variant="rounded"
            width={104}
            height={36}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rounded"
            width={104}
            height={36}
            sx={{ borderRadius: 1 }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

export default RequestCardSkeleton;
