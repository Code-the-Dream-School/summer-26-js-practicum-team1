
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

import { COLORS } from '../../utils/constants.js';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { URGENCY_OPTIONS } from '../../utils/requester.constants.js';
import { CATEGORIES } from '../../utils/browse.constants.js';


function EditRequestDialog({
  open,
  editLoading,
  updating,
  editError,
  editForm,
  locationSuggestions,
  isSearchingLocation,
  onClose,
  onChange,
  onAddressChange,
  onSelectAddress,
  onUpdate,
}) 

{
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
              {CATEGORIES.map((category) => (
  <MenuItem
    key={category.apiValue}
    value={category.apiValue}
  >
    {category.label}
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
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
/>


            {/* ADDRESS */}

            <TextField
  label="Address"
  name="address"
  value={editForm.address}
  onChange={onAddressChange}
  fullWidth
  required
  multiline
  minRows={2}
/>

{locationSuggestions.length > 0 && (
  <Box
    sx={{
      border: '1px solid #D7E5D8',
      borderRadius: 2,
      mt: 1,
      backgroundColor: '#FFFFFF',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}
  >
    {locationSuggestions.map((location) => (
      <Button
        key={
          location.placeId ||
          `${location.latitude}-${location.longitude}`
        }
        type="button"
        fullWidth
        onClick={() => onSelectAddress(location)}
        sx={{
          justifyContent: 'flex-start',
          textAlign: 'left',
          px: 2,
          py: 1.5,
          color: '#1E293B',
          textTransform: 'none',
          borderRadius: 0,
          '&:hover': {
            backgroundColor: '#E8F5E9',
          },
        }}
      >
        <LocationOnOutlinedIcon
          sx={{
            mr: 1,
            color: '#2E7D32',
          }}
        />

        {location.label}
      </Button>
    ))}
  </Box>
)}

{isSearchingLocation && (
  <Typography
    variant="caption"
    color="text.secondary"
    sx={{
      display: 'block',
      mt: 1,
    }}
  >
    Searching for addresses...
  </Typography>
)}


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

