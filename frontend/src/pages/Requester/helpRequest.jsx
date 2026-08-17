import {
  searchPlaces,
  reverseGeocode,
} from '../../services/geoapify';
import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import { useHelpRequests } from '../../hooks/useHelpRequests';
import { useAuth } from '../../hooks/useAuth';

const categories = [
  { label: 'Grocery', value: 'GROCERY' },
  { label: 'Transportation', value: 'TRANSPORTATION' },
  { label: 'Household Chores', value: 'HOUSEHOLD_CHORES' },
  { label: 'Yard Work', value: 'YARD_WORK' },
  { label: 'Pet Care', value: 'PET_CARE' },
  { label: 'Tech Support', value: 'TECH_SUPPORT' },
  { label: 'Companionship', value: 'COMPANIONSHIP' },
  { label: 'Meal Prep', value: 'MEAL_PREP' },
  { label: 'Medical Errand', value: 'MEDICAL_ERRAND' },
  { label: 'Other', value: 'OTHER' },
];

const urgencies = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
];

function NewHelpRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { createHelpRequest, isCreating } = useHelpRequests();

  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    urgency: '',
    date: '',
    time: '',
    description: '',
    address: '',
  });

  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    title: '',
    category: '',
    urgency: '',
    date: '',
    time: '',
    address: '',
    description: '',
  });

  const profileMenuOpen = Boolean(profileMenuAnchor);

  const handleProfileClick = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');

    setFieldErrors((previous) => ({
      ...previous,
      [name]: '',
    }));
  };

  const handleAddressChange = async (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      address: value,
    }));

    setCoordinates({
      latitude: null,
      longitude: null,
    });

    setError('');

    setFieldErrors((previous) => ({
      ...previous,
      address: '',
    }));

    if (value.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      setIsSearchingLocation(true);

      const results = await searchPlaces(value);

      setLocationSuggestions(results);
    } catch (locationError) {
      console.error('Location search failed:', locationError);

      setLocationSuggestions([]);

      setFieldErrors((previous) => ({
        ...previous,
        address:
          'We could not search for this address. Please try again or use your current location.',
      }));
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectAddress = (location) => {
    setFormData((previous) => ({
      ...previous,
      address: location.label,
    }));

    setCoordinates({
      latitude: location.latitude,
      longitude: location.longitude,
    });

    setLocationSuggestions([]);
    setError('');

    setFieldErrors((previous) => ({
      ...previous,
      address: '',
    }));
  };

  const handleGetCurrentAddress = () => {
    if (!navigator.geolocation) {
      setError(
        'Geolocation is not supported by this browser. Please enter your address manually.'
      );
      return;
    }

    setError('');
    setLocationSuggestions([]);
    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setCoordinates({
          latitude,
          longitude,
        });

        setFieldErrors((previous) => ({
          ...previous,
          address: '',
        }));

        try {
          const data = await reverseGeocode(latitude, longitude);

          const currentAddress =
            data.features?.[0]?.properties?.formatted;

          setFormData((previous) => ({
            ...previous,
            address:
              currentAddress ||
              `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }));
        } catch (locationError) {
          console.error(
            'Unable to get current address:',
            locationError
          );

          setFormData((previous) => ({
            ...previous,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }));
        } finally {
          setIsGettingLocation(false);
        }
      },
      (locationError) => {
        console.error('Geolocation error:', locationError);

        setError(
          'Unable to get your current location. Please allow location access and try again.'
        );

        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setFieldErrors({});
    setLocationSuggestions([]);

    const errors = {};

    if (!formData.title.trim()) {
      errors.title =
        'Please enter a title for your help request.';
    } else if (formData.title.trim().length > 100) {
      errors.title =
        'Title must be 100 characters or less.';
    }

    if (!formData.category) {
      errors.category = 'Please select a category.';
    }

    if (!formData.urgency) {
      errors.urgency = 'Please select an urgency level.';
    }

    if (!formData.date) {
      errors.date = 'Please select a date.';
    }

    if (!formData.time) {
      errors.time = 'Please select a time.';
    }

    if (!formData.address.trim()) {
      errors.address =
        'Please enter the address where help is needed.';
    } else if (
      coordinates.latitude === null ||
      coordinates.longitude === null
    ) {
      errors.address =
        'Please select an address from the suggestions or use your current location.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      setError(
        'Please correct the highlighted fields and try again.'
      );

      return;
    }

    const scheduledAt = new Date(
      `${formData.date}T${formData.time}`
    );

    if (Number.isNaN(scheduledAt.getTime())) {
      setFieldErrors({
        date: 'Please enter a valid date.',
        time: 'Please enter a valid time.',
      });

      setError('Please enter a valid date and time.');

      return;
    }

    if (scheduledAt <= new Date()) {
      setFieldErrors({
        date: 'Please select a future date.',
        time: 'Please select a future time.',
      });

      setError(
        'The help request date and time must be in the future.'
      );

      return;
    }

    const request = {
      title: formData.title.trim(),
      category: formData.category,
      urgency: formData.urgency,
      scheduledAt: scheduledAt.toISOString(),
      address: formData.address.trim(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      description: formData.description.trim(),
    };

    try {
      await createHelpRequest({
        data: request,
        csrfToken: user?.csrfToken,
      });

      setSuccess(
        'Your help request has been submitted successfully! Our volunteers will review your request, and someone will be in touch with you soon.'
      );

      setFormData({
        title: '',
        category: '',
        urgency: '',
        date: '',
        time: '',
        description: '',
        address: '',
      });

      setCoordinates({
        latitude: null,
        longitude: null,
      });

      setFieldErrors({});

      setTimeout(() => {
        navigate('/requester-dashboard');
      }, 3000);
    } catch (submitError) {
      console.error(
        'Create help request error:',
        submitError
      );

      if (submitError.response?.status === 400) {
        const serverDetails =
          submitError.response?.data?.details;

        if (Array.isArray(serverDetails)) {
          const serverFieldErrors = {};

          serverDetails.forEach((detail) => {
            if (detail.field) {
              serverFieldErrors[detail.field] =
                detail.message ||
                'This field is invalid.';
            }
          });

          if (
            Object.keys(serverFieldErrors).length > 0
          ) {
            setFieldErrors(serverFieldErrors);
          }
        }

        setError(
          'Some information is invalid. Please check the highlighted fields and try again.'
        );

        return;
      }

      if (submitError.response?.status === 401) {
        setError(
          'Your session has expired. Please sign in again before submitting a help request.'
        );

        return;
      }

      if (submitError.response?.status === 403) {
        setError(
          'We could not verify your request. Please refresh the page and try again.'
        );

        return;
      }

      if (submitError.response?.status === 409) {
        setError(
          'This help request could not be created because it conflicts with an existing request.'
        );

        return;
      }

      if (submitError.response?.status >= 500) {
        setError(
          'We are having trouble creating your help request right now. Please try again in a few minutes.'
        );

        return;
      }

      if (!submitError.response) {
        setError(
          'We could not connect to the server. Please check your internet connection and try again.'
        );

        return;
      }

      setError(
        'We could not create your help request. Please check your information and try again.'
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F7FAF7',
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',
          color: '#1E293B',
          borderBottom: '1px solid #D7E5D8',
        }}
      >
        <Toolbar
          sx={{
            maxWidth: '1200px',
            width: '100%',
            mx: 'auto',
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              flexGrow: 1,
              color: '#1B5E20',
            }}
          >
            🏠 Neighborhood Helper
          </Typography>

          <Button
            onClick={handleProfileClick}
            sx={{
              minWidth: 0,
              textTransform: 'none',
              color: '#1E293B',
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#2E7D32',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'R'}
            </Avatar>

            <Typography
              variant="body2"
              fontWeight={600}
            >
              {user?.name || 'Requester'}
            </Typography>
          </Button>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={profileMenuAnchor}
        open={profileMenuOpen}
        onClose={handleProfileClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            handleProfileClose();
            navigate('/requester-dashboard');
          }}
        >
          Dashboard
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleProfileClose();
          
          }}
        >
          Edit Profile
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleProfileClose();
           
          }}
        >
          Sign Out
        </MenuItem>
      </Menu>

      <Box
        sx={{
          maxWidth: '760px',
          mx: 'auto',
          px: {
            xs: 2,
            sm: 3,
          },
          py: {
            xs: 4,
            sm: 6,
          },
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: '#1B5E20',
              mb: 1,
            }}
          >
            Create a Help Request
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#64748B',
            }}
          >
            Let your neighbors know how they can help.
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: 3,
            px: {
              xs: 3,
              sm: 5,
            },
            py: {
              xs: 4,
              sm: 5,
            },
            border: '1px solid #D7E5D8',
            boxShadow:
              '0 4px 16px rgba(46, 125, 50, 0.08)',
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
            >
              {success}
            </Alert>
          )}

          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              color: '#1F2937',
              mb: 2.5,
            }}
          >
            What do you need help with?
          </Typography>

          <TextField
            fullWidth
            required
            label="Request Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What help do you need?"
            inputProps={{
              maxLength: 100,
            }}
            error={Boolean(fieldErrors.title)}
            helperText={fieldErrors.title}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: '#2E7D32',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#2E7D32',
              },
            }}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 2,
              mb: 4,
            }}
          >
            <TextField
              select
              fullWidth
              required
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={Boolean(fieldErrors.category)}
              helperText={fieldErrors.category}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                  borderColor: '#2E7D32',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2E7D32',
                },
              }}
            >
              {categories.map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              required
              label="Urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              error={Boolean(fieldErrors.urgency)}
              helperText={fieldErrors.urgency}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                  borderColor: '#2E7D32',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2E7D32',
                },
              }}
            >
              {urgencies.map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              color: '#1F2937',
              mb: 2.5,
            }}
          >
            📅 When do you need help?
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                component="label"
                htmlFor="date"
                sx={{
                  display: 'block',
                  mb: 0.8,
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#334155',
                }}
              >
                Date{' '}
                <span style={{ color: '#d32f2f' }}>
                  *
                </span>
              </Typography>

              <TextField
                id="date"
                fullWidth
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                error={Boolean(fieldErrors.date)}
                helperText={fieldErrors.date}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '56px',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#2E7D32',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="time"
                sx={{
                  display: 'block',
                  mb: 0.8,
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#334155',
                }}
              >
                Time{' '}
                <span style={{ color: '#d32f2f' }}>
                  *
                </span>
              </Typography>

              <TextField
                id="time"
                fullWidth
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                error={Boolean(fieldErrors.time)}
                helperText={fieldErrors.time}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '56px',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#2E7D32',
                  },
                }}
              />
            </Box>
          </Box>

          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              color: '#1F2937',
              mb: 2.5,
            }}
          >
            Tell us more
          </Typography>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            minRows={4}
            placeholder="Describe the help you need..."
            error={Boolean(fieldErrors.description)}
            helperText={fieldErrors.description}
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: '#2E7D32',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#2E7D32',
              },
            }}
          />

          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              color: '#1F2937',
              mb: 2.5,
            }}
          >
            📍 Where do you need help?
          </Typography>

          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              required
              label="Current Address"
              name="address"
              value={formData.address}
              onChange={handleAddressChange}
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

            {locationSuggestions.length > 0 && (
              <Box
                sx={{
                  border: '1px solid #D7E5D8',
                  borderRadius: 2,
                  mt: 1,
                  backgroundColor: '#FFFFFF',
                  overflow: 'hidden',
                  boxShadow:
                    '0 4px 12px rgba(0,0,0,0.08)',
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
                    onClick={() =>
                      handleSelectAddress(location)
                    }
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

            <Button
              type="button"
              startIcon={<MyLocationIcon />}
              onClick={handleGetCurrentAddress}
              disabled={isGettingLocation || isCreating}
              sx={{
                mt: 1,
                textTransform: 'none',
                color: '#2E7D32',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#E8F5E9',
                },
              }}
            >
              {isGettingLocation
                ? 'Getting current location...'
                : 'Use my current location'}
            </Button>

            {coordinates.latitude !== null &&
              coordinates.longitude !== null && (
                <Box
                  sx={{
                    mt: 1,
                    px: 2,
                    py: 1,
                    backgroundColor: '#E8F5E9',
                    borderRadius: 1.5,
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

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              pt: 1,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={() =>
                navigate('/requester-dashboard')
              }
              disabled={isCreating}
              sx={{
                px: 4,
                py: 1.3,
                borderRadius: 2,
                textTransform: 'none',
                borderColor: '#A5B8A7',
                color: '#475569',
                '&:hover': {
                  borderColor: '#2E7D32',
                  backgroundColor: '#F1F8F2',
                },
              }}
            >
              Cancel
            </Button>

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
        </Box>
      </Box>
    </Box>
  );
}

export default NewHelpRequest;