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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
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

function NewRequest() {
  const navigate = useNavigate();

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

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
  };

  const handleGetCurrentAddress = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setError('');
    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setCoordinates({
          latitude,
          longitude,
        });

        try {
          /*
           * This uses the existing frontend Geoapify configuration.
           *
           * IMPORTANT:
           * If your project already has a Geoapify service,
           * use that service instead of calling Geoapify here.
           */
          const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

          if (!apiKey) {
            setFormData((previous) => ({
              ...previous,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            }));

            setIsGettingLocation(false);
            return;
          }

          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`
          );

          if (!response.ok) {
            throw new Error('Unable to find address');
          }

          const data = await response.json();

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

    if (!formData.title.trim()) {
      setError('Please enter a title for your help request.');
      return;
    }

    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    if (!formData.urgency) {
      setError('Please select an urgency.');
      return;
    }

    if (!formData.date || !formData.time) {
      setError('Please select both a date and time.');
      return;
    }

    if (!formData.address.trim()) {
      setError('Please enter your current address.');
      return;
    }

    /*
     * The current backend requires latitude and longitude.
     * These are populated when the user clicks
     * "Use my current location".
     */
    if (
      coordinates.latitude === null ||
      coordinates.longitude === null
    ) {
      setError(
        'Please use your current location so we can determine the location coordinates.'
      );
      return;
    }

    const scheduledAt = new Date(
      `${formData.date}T${formData.time}`
    );

    if (Number.isNaN(scheduledAt.getTime())) {
      setError('Please enter a valid date and time.');
      return;
    }

    if (scheduledAt <= new Date()) {
      setError('Please select a future date and time.');
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
      setIsSubmitting(true);

      const response = await fetch('/api/requests', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            result?.message ||
            'Unable to create help request.'
        );
      }

      setSuccess('Your help request was created successfully.');

      setTimeout(() => {
        navigate('/requester-dashboard');
      }, 1000);
    } catch (submitError) {
      console.error('Create help request error:', submitError);

      setError(
        submitError.message ||
          'Unable to create your help request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',
          color: '#1E293B',
          borderBottom: '1px solid #E2E8F0',
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
            sx={{ flexGrow: 1 }}
          >
            🏠 Neighborhood Helper
          </Typography>

          <Button
            onClick={handleProfileClick}
            sx={{
              minWidth: 0,
              textTransform: 'none',
              color: 'inherit',
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#2563EB',
              }}
            >
              A
            </Avatar>

            <Typography
              variant="body2"
              fontWeight={600}
            >
              Archana
            </Typography>
          </Button>
        </Toolbar>
      </AppBar>

      {/* Profile menu */}
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
            console.log('Edit Profile');
          }}
        >
          Edit Profile
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleProfileClose();
            console.log('Sign Out');
          }}
        >
          Sign Out
        </MenuItem>
      </Menu>

      {/* Page */}
      <Box
        sx={{
          maxWidth: '700px',
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 4, sm: 6 },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: 3,
            px: { xs: 3, sm: 5 },
            py: { xs: 4, sm: 5 },
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ mb: 4 }}
          >
            Create a Help Request
          </Typography>

          {/* Error */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* Success */}
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 3 }}
            >
              {success}
            </Alert>
          )}

          {/* Title */}
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
            sx={{ mb: 3 }}
          />

          {/* Category */}
          <TextField
            select
            fullWidth
            required
            label="Select Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            sx={{ mb: 3 }}
            SelectProps={{
              native: true,
              IconComponent: ExpandMoreIcon,
            }}
          >
            <option value="" />
            {categories.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </TextField>

          {/* Urgency */}
          <TextField
            select
            fullWidth
            required
            label="Urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            sx={{ mb: 3 }}
            SelectProps={{
              native: true,
              IconComponent: ExpandMoreIcon,
            }}
          >
            <option value="" />
            {urgencies.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </TextField>

          {/* Date */}
          <TextField
            fullWidth
            required
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 3 }}
          />

          {/* Time */}
          <TextField
            fullWidth
            required
            label="Time"
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 3 }}
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            minRows={4}
            placeholder="Describe the help you need..."
            sx={{ mb: 3 }}
          />

          {/* Current address */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              required
              label="Current Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your current address"
              multiline
              minRows={2}
              InputProps={{
                startAdornment: (
                  <LocationOnOutlinedIcon
                    sx={{
                      mr: 1,
                      color: 'text.secondary',
                    }}
                  />
                ),
              }}
            />

            <Button
              type="button"
              startIcon={
                <AddLocationAltOutlinedIcon />
              }
              onClick={handleGetCurrentAddress}
              disabled={isGettingLocation}
              sx={{
                mt: 1,
                textTransform: 'none',
              }}
            >
              {isGettingLocation
                ? 'Getting current location...'
                : 'Use my current location'}
            </Button>

            {coordinates.latitude !== null &&
              coordinates.longitude !== null && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    mt: 1,
                  }}
                >
                  Location coordinates captured.
                </Typography>
              )}
          </Box>

          {/* Submit */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={() =>
                navigate('/requester-dashboard')
              }
              disabled={isSubmitting}
              sx={{
                px: 4,
                py: 1.3,
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                px: 4,
                py: 1.3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isSubmitting
                ? 'Creating...'
                : 'Create My Request'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default NewRequest;