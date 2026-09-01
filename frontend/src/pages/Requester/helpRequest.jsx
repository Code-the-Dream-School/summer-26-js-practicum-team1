import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { searchPlaces, reverseGeocode } from '../../services/geoapify';

import { useHelpRequests } from '../../hooks/useHelpRequests';
import { useAuth } from '../../hooks/useAuth';

import HelpRequestForm from '../../components/newRequest/HelpRequestForm';
import RequestLocationField from '../../components/newRequest/RequestLocationField';
import RequestFormActions from '../../components/newRequest/RequestFormActions';

import { CATEGORY, URGENCY_OPTIONS } from '../../utils/requester.constants';

function NewHelpRequest() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { createHelpRequest, isCreating } = useHelpRequests();

  const addressSearchTimeoutRef = useRef(null);

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
  });

  useEffect(() => {
    return () => {
      if (addressSearchTimeoutRef.current) {
        clearTimeout(addressSearchTimeoutRef.current);
      }
    };
  }, []);

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

  const handleAddressChange = (event) => {
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

    if (addressSearchTimeoutRef.current) {
      clearTimeout(addressSearchTimeoutRef.current);
    }

    if (value.trim().length < 2) {
      setLocationSuggestions([]);
      setIsSearchingLocation(false);
      return;
    }

    setIsSearchingLocation(true);

    addressSearchTimeoutRef.current = setTimeout(async () => {
      try {
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
    }, 300);
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

          const currentAddress = data.features?.[0]?.properties?.formatted;

          setFormData((previous) => ({
            ...previous,
            address:
              currentAddress ||
              `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }));
        } catch (locationError) {
          console.error('Unable to get current address:', locationError);

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
    setFieldErrors({
      title: '',
      category: '',
      urgency: '',
      date: '',
      time: '',
      address: '',
    });

    setLocationSuggestions([]);

    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Please enter a title for your help request.';
    } else if (formData.title.trim().length > 100) {
      errors.title = 'Title must be 100 characters or less.';
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
      errors.address = 'Please enter the address where help is needed.';
    } else if (
      coordinates.latitude === null ||
      coordinates.longitude === null
    ) {
      errors.address =
        'Please select an address from the suggestions or use your current location.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      setError('Please correct the highlighted fields and try again.');

      return;
    }

    const scheduledAt = new Date(`${formData.date}T${formData.time}`);

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

      setError('The help request date and time must be in the future.');

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

    /*
       CREATE REQUEST */

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

      setFieldErrors({
        title: '',
        category: '',
        urgency: '',
        date: '',
        time: '',
        address: '',
      });

      setTimeout(() => {
        navigate('/requester-dashboard');
      }, 3000);
    } catch (submitError) {
      console.error('Create help request error:', submitError);

      if (submitError.response?.status === 400) {
        const serverDetails = submitError.response?.data?.details;

        if (Array.isArray(serverDetails)) {
          const serverFieldErrors = {};

          serverDetails.forEach((detail) => {
            if (detail.field) {
              serverFieldErrors[detail.field] =
                detail.message || 'This field is invalid.';
            }
          });

          if (Object.keys(serverFieldErrors).length > 0) {
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

  /* CANCEL */

  const handleCancel = () => {
    if (!isCreating) {
      navigate('/requester-dashboard');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F7FAF7',
      }}
    >
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
        {/* PAGE HEADER */}

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
              color: '#050505',
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
            boxShadow: '0 4px 16px rgba(46, 125, 50, 0.08)',
          }}
        >
          {/* ERROR */}

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

          {/* MAIN FORM */}

          <HelpRequestForm
            formData={formData}
            fieldErrors={fieldErrors}
            onChange={handleChange}
            categories={CATEGORY.map((item) => ({
              value: item,
              label: item
                .replaceAll('_', ' ')
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase()),
            }))}
            urgencies={URGENCY_OPTIONS.map((item) => ({
              value: item,
              label: item.charAt(0) + item.slice(1).toLowerCase(),
            }))}
          />

          {/* LOCATION */}

          <RequestLocationField
            formData={formData}
            fieldErrors={fieldErrors}
            coordinates={coordinates}
            locationSuggestions={locationSuggestions}
            isSearchingLocation={isSearchingLocation}
            isGettingLocation={isGettingLocation}
            isCreating={isCreating}
            onAddressChange={handleAddressChange}
            onSelectAddress={handleSelectAddress}
            onGetCurrentAddress={handleGetCurrentAddress}
          />

          <RequestFormActions isCreating={isCreating} onCancel={handleCancel} />
        </Box>
      </Box>
    </Box>
  );
}

export default NewHelpRequest;
