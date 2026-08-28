import {
  Box,
  Button,
} from '@mui/material';

function RequestFormActions({
  isCreating,
  onCancel,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        pt: 1,
      }}
    >
      {/* CANCEL */}

      <Button
        type="button"
        variant="outlined"
        onClick={onCancel}
        disabled={isCreating}
        sx={{
          px: 4,
          py: 1.3,
          borderRadius: 2,
          textTransform: 'none',
          borderColor: '#CBD5E1',
          color: '#475569',

          '&:hover': {
            borderColor: '#64748B',
            backgroundColor: '#F8FAFC',
          },
        }}
      >
        Cancel
      </Button>

      {/* CREATE */}

      <Button
        type="submit"
        variant="contained"
        disabled={isCreating}
        sx={{
          px: 4,
          py: 1.3,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
         backgroundColor: '#2E7D32',

          '&:hover': {
           backgroundColor: '#1B5E20',
          },
        }}
      >
        {isCreating
          ? 'Creating...'
          : 'Create My Request'}
      </Button>
    </Box>
  );
}

export default RequestFormActions;