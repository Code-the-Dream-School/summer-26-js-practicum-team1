
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

function CancelRequestDialog({
  open,
  cancelRequest,
  cancelling,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        Cancel Help Request?
      </DialogTitle>

      <DialogContent>
        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
          }}
        >
          Are you sure you want to
          cancel this help request?
        </Typography>

        {cancelRequest && (
          <Typography
            fontWeight={600}
            sx={{
              mt: 2,
            }}
          >
            {cancelRequest.title}
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
        }}
      >
        <Button
          onClick={onClose}
          disabled={cancelling}
          sx={{
            textTransform: 'none',
          }}
        >
          Keep Request
        </Button>

        <Button
          onClick={onConfirm}
          disabled={cancelling}
          variant="contained"
          color="error"
          sx={{
            textTransform: 'none',
          }}
        >
          {cancelling
            ? 'Cancelling...'
            : 'Cancel Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CancelRequestDialog;

