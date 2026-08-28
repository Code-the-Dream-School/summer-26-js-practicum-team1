
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { COLORS } from '../../utils/browse.constants.js';

import {
  CATEGORY,
  URGENCY_OPTIONS,
} from '../../utils/requester.constants.js';


function EditRequestDialog({
  open,
  editLoading,
  updating,
  editError,
  editForm,
  onClose,
  onChange,
  onUpdate,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.5rem',
        }}
      >
        Edit Help Request
      </DialogTitle>


      <DialogContent dividers>

        {editLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 5,
            }}
          >
            <CircularProgress color="success" />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              pt: 1,
            }}
          >

            {/* EDIT ERROR */}

            {editError && (
              <Typography
                color="error"
                sx={{
                  fontSize: '0.95rem',
                }}
              >
                {editError}
              </Typography>
            )}


            {/* TITLE */}

            <TextField
              label="Title"
              name="title"
              value={editForm.title}
              onChange={onChange}
              fullWidth
              required
            />


            {/* CATEGORY */}

            <TextField
              select
              label="Category"
              name="category"
              value={editForm.category}
              onChange={onChange}
              fullWidth
              required
            >
              {CATEGORY.map((category) => (
                <MenuItem
                  key={category}
                  value={category}
                >
                  {category.replaceAll('_', ' ')}
                </MenuItem>
              ))}
            </TextField>


            {/* URGENCY */}

            <TextField
              select
              label="Urgency"
              name="urgency"
              value={editForm.urgency}
              onChange={onChange}
              fullWidth
              required
            >
              {URGENCY_OPTIONS.map((urgency) => (
                <MenuItem
                  key={urgency}
                  value={urgency}
                >
                  {urgency}
                </MenuItem>
              ))}
            </TextField>


            {/* DATE + TIME */}

            <TextField
              label="Date & Time"
              name="scheduledAt"
              type="datetime-local"
              value={editForm.scheduledAt}
              onChange={onChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />


            {/* ADDRESS */}

            <TextField
              label="Address"
              name="address"
              value={editForm.address}
              onChange={onChange}
              fullWidth
              required
            />


            {/* DESCRIPTION */}

            <TextField
              label="Description"
              name="description"
              value={editForm.description}
              onChange={onChange}
              fullWidth
              multiline
              minRows={4}
            />

          </Box>
        )}

      </DialogContent>


      <DialogActions
        sx={{
          p: 2,
          gap: 1,
        }}
      >

        <Button
          onClick={onClose}
          disabled={updating}
          sx={{
            textTransform: 'none',
          }}
        >
          Cancel
        </Button>


        <Button
          onClick={onUpdate}
          variant="contained"
          disabled={
            editLoading ||
            updating ||
            !open
          }
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            backgroundColor: COLORS.primary,

            '&:hover': {
              backgroundColor:
                COLORS.primaryHover,
            },
          }}
        >
          {updating
            ? 'Updating...'
            : 'Update Request'}
        </Button>

      </DialogActions>

    </Dialog>
  );
}


export default EditRequestDialog;

