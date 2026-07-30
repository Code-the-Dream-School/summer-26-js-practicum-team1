import { Box, Pagination as MuiPagination } from '@mui/material';

function Pagination({ page, totalPages, onChange }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: 4,
      }}
    >
      <MuiPagination
        count={totalPages}
        page={page}
        onChange={(event, value) => onChange(value)}
        color="primary"
      />
    </Box>
  );
}

export default Pagination;
