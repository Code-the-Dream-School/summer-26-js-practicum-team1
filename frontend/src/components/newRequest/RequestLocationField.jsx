import { Box, Button, TextField, Typography } from '@mui/material';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';

function RequestLocationField({
  formData,
  fieldErrors,
  locationSuggestions,
  isSearchingLocation,
  isGettingLocation,
  isCreating,
  coordinates,
  onAddressChange,
  onSelectAddress,
  onGetCurrentAddress,
}) {
  return (
    <>
      {/* LOCATION TITLE */}

      <Typography
        variant="h6"
        fontWeight={600}
        sx={{
          color: '#1F2937',
          mb: 2.5,
        }}
      >
        Where do you need help?
      </Typography>

      <Box sx={{ mb: 4 }}>
        {/* ADDRESS */}

        <TextField
          fullWidth
          required
          label="Current Address"
          name="address"
          value={formData.address}
          onChange={onAddressChange}
          placeholder="Enter your current address"
          multiline
          minRows={2}
          error={Boolean(fieldErrors.address)}
          helperText={fieldErrors.address}
          InputProps={{
            startAdornment: (
              <LocationOnOutlinedIcon
                sx={{
                  mr: 1,
                  color: '#2E7D32',
                }}
              />
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root.Mui-focused fieldset': {
              borderColor: '#2E7D32',
            },

            '& .MuiInputLabel-root.Mui-focused': {
              color: '#2E7D32',
            },
          }}
        />

        {/* LOCATION SUGGESTIONS */}

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

        {/* SEARCHING MESSAGE */}

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

        {/* CURRENT LOCATION BUTTON */}

        <Button
          type="button"
          startIcon={<MyLocationIcon />}
          onClick={onGetCurrentAddress}
          disabled={isGettingLocation || isCreating}
          sx={{
            mt: 1,
            textTransform: 'none',
            color: '#2E7D32',
            fontWeight: 600,

            '&:hover': {
              backgroundColor: '#F1F8F2',
            },
          }}
        >
          {isGettingLocation
            ? 'Getting current location...'
            : 'Use my current location'}
        </Button>

        {/* COORDINATES CONFIRMATION */}

        {coordinates.latitude !== null && coordinates.longitude !== null && (
          <Box
            sx={{
              mt: 1,
              px: 2,
              py: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#2E7D32',
                fontWeight: 600,
              }}
            >
              ✓ Location coordinates captured
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
}

export default RequestLocationField;
