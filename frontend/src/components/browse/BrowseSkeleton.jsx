import { Stack, Skeleton, Box } from '@mui/material';
import RequestCardSkeleton from './RequestCardSkeleton';
import FilterSidebarSkeleton from './FilterSidebarSkeleton';

function BrowseSkeleton() {
  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
        <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
        <Skeleton variant="rounded" width={120} height={56} />
      </Stack>

      <Box
        sx={{
          mt: 4,
          display: 'flex',
          gap: '32px',
        }}
      >
        <Box sx={{ width: '250px', flexShrink: 0 }}>
          <FilterSidebarSkeleton />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Skeleton width={180} height={24} sx={{ mb: 2 }} />

          {Array.from({ length: 4 }).map((_, i) => (
            <RequestCardSkeleton key={i} />
          ))}
        </Box>
      </Box>
    </>
  );
}

export default BrowseSkeleton;
