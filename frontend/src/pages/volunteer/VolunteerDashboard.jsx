import { useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import RequestCard from '../../components/requesterDashbord/RequestCard';
import RequestFilters from '../../components/requesterDashbord/RequestFilters.jsx';

import { useVolunteerAcceptedRequests } from '../../hooks/useHelpRequests';
import { useGetUnreadCount } from '../../hooks/useChat';

import { COLORS } from '../../utils/constants.js';

function VolunteerDashboard() {
  const navigate = useNavigate();

  const { helpRequests, isLoading, isError, error } =
    useVolunteerAcceptedRequests();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('SOONEST');
  const [expandedRequest, setExpandedRequest] = useState(null);

  const { data: unreadData } = useGetUnreadCount();

  const unreadByRequest = unreadData?.byRequest ?? {};

  const filteredRequests = helpRequests.filter((request) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    return (
      request.title?.toLowerCase().includes(searchText) ||
      request.description?.toLowerCase().includes(searchText)
    );
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'URGENCY') {
      const urgencyOrder = {
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
      };

      return (urgencyOrder[a.urgency] || 99) - (urgencyOrder[b.urgency] || 99);
    }

    return (
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  });

  const handleBrowseRequests = () => {
    navigate('/browse');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: COLORS.background || '#fff',
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Container maxWidth="lg">
        {/* PAGE HEADER */}

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              color: COLORS.text,
              fontWeight: 800,
              mb: 1,
            }}
          >
            My Helping Tasks
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: COLORS.textMuted,
            }}
          >
            View and manage the help requests you have accepted.
          </Typography>
        </Box>

        {/* FILTERS */}

        <RequestFilters
          search={search}
          setSearch={setSearch}
          filter="ACCEPTED"
          setFilter={() => {}}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onNewRequest={handleBrowseRequests}
          dashboardType="volunteer"
        />

        {/* LOADING */}

        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 6,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* ERROR */}

        {isError && !isLoading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error?.message || 'Unable to load accepted requests.'}
          </Alert>
        )}

        {/* EMPTY STATE */}

        {!isLoading && !isError && sortedRequests.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: COLORS.text,
                mb: 1,
              }}
            >
              No accepted requests
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: COLORS.textMuted,
                mb: 3,
              }}
            >
              Browse available requests and accept one to see it here.
            </Typography>
          </Box>
        )}

        {/* REQUEST CARDS */}

        {!isLoading && !isError && sortedRequests.length > 0 && (
          <Grid container spacing={3}>
            {sortedRequests.map((request) => (
              <Grid size={12} key={request.id}>
                <RequestCard
                  request={request}
                  expandedRequest={expandedRequest}
                  setExpandedRequest={setExpandedRequest}
                  dashboardType="volunteer"
                  userRole="VOLUNTEER"
                  unreadCount={unreadByRequest[request.id] ?? 0}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default VolunteerDashboard;
