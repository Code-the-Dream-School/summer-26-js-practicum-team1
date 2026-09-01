import { useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography } from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { searchPlaces } from '../../services/geoapify';
import {
  getMe,
  getHelpRequests,
  getHelpRequestById,
  updateHelpRequest,
  cancelHelpRequest,
} from '../../services/api';

import RequestCard from '../../components/requesterDashbord/RequestCard.jsx';
import RequestFilters from '../../components/requesterDashbord/RequestFilters.jsx';
import VolunteerProfileDialog from '../../components/requesterDashbord/VolunteerProfileDialog.jsx';
import EditRequestDialog from '../../components/requesterDashbord/EditRequestDialog.jsx';
import CancelRequestDialog from '../../components/requesterDashbord/CancelRequestDialog.jsx';

import { COLORS } from '../../utils/constants.js';

import {
  formatDateTimeLocal,
  URGENCY_RANK,
} from '../../utils/requester.constants.js';

import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export default function RequesterDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  /* SEARCH + FILTER + SORT */

  const [search, setSearch] = useState('');

  const [filter, setFilter] = useState('ALL');

  const [sortBy, setSortBy] = useState('SOONEST');

  const debouncedSearch = useDebouncedValue(search, 300);

  /* EXPANDED REQUEST */

  const [expandedRequest, setExpandedRequest] = useState(null);

  /* VOLUNTEER PROFILE DIALOG  */

  const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false);

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  /* EDIT STATE*/

  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [editRequest, setEditRequest] = useState(null);

  const [editLoading, setEditLoading] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [editError, setEditError] = useState('');

  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    urgency: '',
    scheduledAt: '',
    address: '',
    latitude: '',
    longitude: '',
    description: '',
  });

  const debouncedEditAddress = useDebouncedValue(editForm.address, 300);

  useEffect(() => {
    if (!editRequest) {
      setLocationSuggestions([]);
      return;
    }

    const address = debouncedEditAddress.trim();

    if (address.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    let cancelled = false;

    const loadSuggestions = async () => {
      try {
        setIsSearchingLocation(true);

        const suggestions = await searchPlaces(address);

        if (!cancelled) {
          setLocationSuggestions(suggestions);
        }
      } catch (err) {
        console.error('Failed to search edit address:', err);

        if (!cancelled) {
          setLocationSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearchingLocation(false);
        }
      }
    };

    loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [debouncedEditAddress, editRequest]);
  /*CANCEL STATE */

  const [cancelRequest, setCancelRequest] = useState(null);

  const [cancelling, setCancelling] = useState(false);

  /* LOAD DASHBOARD */

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const currentUser = await getMe();

        if (!currentUser) {
          navigate('/login');
          return;
        }

        setUser(currentUser);

        const response = await getHelpRequests();

        setRequests(response?.data || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);

        setError('Unable to load your requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  /* NEW REQUEST */

  const handleNewRequest = () => {
    navigate('/helpRequest');
  };

  /*  VOLUNTEER PROFILE */

  const handleVolunteerProfile = (volunteer) => {
    if (!volunteer) {
      return;
    }

    setSelectedVolunteer(volunteer);

    setVolunteerDialogOpen(true);
  };

  const handleCloseVolunteerDialog = () => {
    setVolunteerDialogOpen(false);

    setSelectedVolunteer(null);
  };

  /* EDIT REQUEST */

  const handleEdit = async (request) => {
    try {
      setEditError('');

      setEditLoading(true);

      const csrfToken = user?.csrfToken;

      if (!csrfToken) {
        setEditError(
          'CSRF token is missing. Please refresh the page and try again.'
        );

        return;
      }

      const currentRequest = await getHelpRequestById(request.id);

      setEditRequest(currentRequest);

      setEditForm({
        title: currentRequest.title || '',

        category: currentRequest.category || '',

        urgency: currentRequest.urgency || '',

        scheduledAt: formatDateTimeLocal(currentRequest.scheduledAt),

        address: currentRequest.address || '',

        latitude:
          currentRequest.latitude !== null &&
          currentRequest.latitude !== undefined
            ? String(currentRequest.latitude)
            : '',

        longitude:
          currentRequest.longitude !== null &&
          currentRequest.longitude !== undefined
            ? String(currentRequest.longitude)
            : '',

        description: currentRequest.description || '',
      });
    } catch (err) {
      console.error('Failed to load request for editing:', err);

      setEditError('Unable to load this request for editing.');
    } finally {
      setEditLoading(false);
    }
  };

  /* CLOSE EDIT DIALOG  */

  const handleCloseEditDialog = () => {
    if (!updating) {
      setEditRequest(null);

      setEditError('');
    }
  };

  /* EDIT FIELD CHANGE */

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEditAddressChange = (event) => {
    const { value } = event.target;

    setEditForm((current) => ({
      ...current,
      address: value,

      latitude: '',
      longitude: '',
    }));
  };
  const handleSelectEditAddress = (location) => {
    setEditForm((current) => ({
      ...current,
      address: location.label,
      latitude: String(location.latitude),
      longitude: String(location.longitude),
    }));

    setLocationSuggestions([]);
  };
  /* UPDATE REQUEST */

  const handleUpdateRequest = async () => {
    if (!editForm.latitude || !editForm.longitude) {
      setEditError(
        'Please select an address from the location suggestions so the location coordinates can be updated.'
      );

      setUpdating(false);
      return;
    }

    try {
      setUpdating(true);

      setEditError('');

      setError('');

      const updatedData = {
        title: editForm.title.trim(),

        category: editForm.category,

        urgency: editForm.urgency,

        scheduledAt: new Date(editForm.scheduledAt).toISOString(),

        address: editForm.address.trim(),

        latitude: Number(editForm.latitude),

        longitude: Number(editForm.longitude),

        description: editForm.description.trim(),
      };

      const csrfToken = user?.csrfToken;

      if (!csrfToken) {
        setEditError(
          'CSRF token is missing. Please refresh the page and try again.'
        );

        return;
      }

      const updatedRequest = await updateHelpRequest(
        editRequest.id,
        updatedData,
        csrfToken
      );

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === editRequest.id
            ? {
                ...request,

                ...(updatedRequest?.data || updatedRequest),
              }
            : request
        )
      );

      setEditRequest(null);
    } catch (err) {
      console.error('Failed to update request:', err);

      console.error('Status:', err?.response?.status);

      console.error('Server response:', err?.response?.data);

      setEditError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Unable to update this request. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  /* OPEN CANCEL DIALOG */

  const handleCancel = (request) => {
    setCancelRequest(request);
  };

  /* CLOSE CANCEL DIALOG */

  const handleCloseCancelDialog = () => {
    if (!cancelling) {
      setCancelRequest(null);
    }
  };

  /* CONFIRM CANCEL */

  const handleConfirmCancel = async () => {
    if (!cancelRequest) {
      return;
    }

    try {
      setCancelling(true);

      setError('');

      const csrfToken = user?.csrfToken;

      if (!csrfToken) {
        setError(
          'CSRF token is missing. Please refresh the page and try again.'
        );

        return;
      }

      await cancelHelpRequest(cancelRequest.id, csrfToken);

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === cancelRequest.id
            ? {
                ...request,
                status: 'CANCELLED',
              }
            : request
        )
      );

      setCancelRequest(null);
    } catch (err) {
      console.error('Failed to cancel request:', err);

      setError('Unable to cancel this request. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  /* FILTER + SEARCH + SORT  */

  const visibleRequests = useMemo(() => {
    let list = [...requests];

    /* STATUS FILTER */

    if (filter === 'PENDING') {
      list = list.filter(
        (request) => String(request.status || '').toUpperCase() === 'PENDING'
      );
    }

    if (filter === 'ACCEPTED') {
      list = list.filter(
        (request) => String(request.status || '').toUpperCase() === 'ACCEPTED'
      );
    }

    /* SEARCH */

    if (debouncedSearch.trim()) {
      const searchText = debouncedSearch.toLowerCase().trim();

      list = list.filter(
        (request) =>
          request.title?.toLowerCase().includes(searchText) ||
          request.description?.toLowerCase().includes(searchText) ||
          request.category?.toLowerCase().includes(searchText) ||
          request.address?.toLowerCase().includes(searchText)
      );
    }

    /* SORT */

    if (sortBy === 'URGENCY') {
      list.sort(
        (a, b) =>
          (URGENCY_RANK[a.urgency] ?? 3) - (URGENCY_RANK[b.urgency] ?? 3)
      );
    } else {
      list.sort(
        (a, b) => new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0)
      );
    }

    return list;
  }, [requests, filter, sortBy, debouncedSearch]);

  /* LOADING */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',
        }}
      >
        <CircularProgress color="success" />
      </Box>
    );
  }

  return (
    <Box>
      {/*PAGE HEADER  */}

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
          }}
        >
          My Help Requests
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            color: COLORS.textMuted,
          }}
        >
          Manage and track your help requests
        </Typography>
      </Box>
      {error && (
        <Typography
          color="error"
          sx={{
            mb: 2,
            fontSize: '1rem',
          }}
        >
          {error}
        </Typography>
      )}

      {/* SEARCH + FILTER + SORT  */}

      <RequestFilters
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onNewRequest={handleNewRequest}
      />

      {/*REQUEST COUNT */}

      <Box
        sx={{
          mb: 2,

          display: 'flex',

          justifyContent: 'space-between',

          alignItems: 'center',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
          }}
        >
          Showing {visibleRequests.length}{' '}
          {visibleRequests.length === 1 ? 'request' : 'requests'}
        </Typography>
      </Box>

      {/* REQUEST LIST */}

      {visibleRequests.length === 0 ? (
        <Typography
          color="text.secondary"
          sx={{
            fontSize: '1rem',
            mt: 4,
          }}
        >
          {search.trim()
            ? 'No requests match your search.'
            : `You don't have any ${
                filter !== 'ALL' ? filter.toLowerCase() : ''
              } requests.`}
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',

            flexDirection: 'column',

            gap: 2,
          }}
        >
          {visibleRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              expandedRequest={expandedRequest}
              setExpandedRequest={setExpandedRequest}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onVolunteerProfile={handleVolunteerProfile}
            />
          ))}
        </Box>
      )}

      <VolunteerProfileDialog
        open={volunteerDialogOpen}
        volunteer={selectedVolunteer}
        onClose={handleCloseVolunteerDialog}
      />
      {/* EDIT REQUEST DIALOG */}

      <EditRequestDialog
        open={Boolean(editRequest)}
        editLoading={editLoading}
        updating={updating}
        editError={editError}
        editForm={editForm}
        locationSuggestions={locationSuggestions}
        isSearchingLocation={isSearchingLocation}
        onClose={handleCloseEditDialog}
        onChange={handleEditChange}
        onAddressChange={handleEditAddressChange}
        onSelectAddress={handleSelectEditAddress}
        onUpdate={handleUpdateRequest}
      />

      {/* CANCEL REQUEST DIALOG */}

      <CancelRequestDialog
        open={Boolean(cancelRequest)}
        cancelRequest={cancelRequest}
        cancelling={cancelling}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
      />
    </Box>
  );
}
