import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  ButtonGroup,
  CircularProgress,
  Alert,
  Autocomplete,
  Pagination,
} from '@mui/material';
import {
  COLORS,
  DEFAULT_DISTANCE_MI,
  CATEGORIES,
  URGENCY_LEVELS,
  PAGE_SIZE,
  fieldSx,
  inputLabelSx,
} from '../utils/browse.constants.js';
import {
  toggleInArray,
  friendlyErrorMessage,
  viewToggleSx,
  mapInterestsToCategoryKeys,
  mapSlotsToDays,
  buildLocationOptionFromProfile,
} from '../utils/browse.utils.js';
import SearchIcon from '@mui/icons-material/Search';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import { useMemo, useState } from 'react';
import {
  useBrowseHelpRequests,
  useCategoryFacets,
} from '../hooks/useHelpRequests.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useLocationAutocomplete } from '../hooks/useLocationAutocomplete.js';
import { useVolunteerProfile } from '../hooks/useVolunteerProfile.js';
import SortControl from '../components/browse/SortControl.jsx';
import FilterSidebar from '../components/browse/FilterSidebar.jsx';
import RequestCard from '../components/browse/RequestCard.jsx';
import BrowseSkeleton from '../components/browse/BrowseSkeleton.jsx';

function Browse() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [view, setView] = useState('list');
  const [page, setPage] = useState(1);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedUrgencies, setSelectedUrgencies] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [distance, setDistance] = useState(DEFAULT_DISTANCE_MI);
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [hasInteracted, setHasInteracted] = useState(false);
  const [prefilledForProfileId, setPrefilledForProfileId] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { results: autocompleteResults, isLoading: isAutocompleting } =
    useLocationAutocomplete(locationQuery);

  const {
    profile,
    volunteer,
    isLoading: isProfileLoading,
  } = useVolunteerProfile();

  const markInteracted = () => {
    setHasInteracted(true);
  };

  if (
    !hasInteracted &&
    !isProfileLoading &&
    profile?.role === 'VOLUNTEER' &&
    volunteer &&
    prefilledForProfileId !== profile.id
  ) {
    setPrefilledForProfileId(profile.id);

    const locationOption = buildLocationOptionFromProfile(volunteer);
    if (locationOption) {
      setSelectedLocation(locationOption);
      setLocationQuery(locationOption.formatted);
    }

    const categoryKeys = mapInterestsToCategoryKeys(volunteer.interests);
    if (categoryKeys.length > 0) {
      setSelectedCategories(categoryKeys);
    }

    const dayKeys = mapSlotsToDays(volunteer.availability?.slots);
    if (dayKeys.length > 0) {
      setSelectedDays(dayKeys);
    }
  }

  const handleClearAll = () => {
    markInteracted();
    setSelectedCategories([]);
    setSelectedUrgencies([]);
    setSelectedDays([]);
    setDistance(DEFAULT_DISTANCE_MI);
    setLocationQuery('');
    setSelectedLocation(null);
  };

  const handleSortChange = (key, dir) => {
    markInteracted();
    if (key === 'distance' && !selectedLocation) {
      setSortKey('createdAt');
      setSortDir('desc');
    } else {
      setSortKey(key);
      setSortDir(dir);
    }
  };

  const handleLocationInputChange = (_, value, reason) => {
    markInteracted();
    setLocationQuery(value);

    if (reason === 'clear') {
      setSelectedLocation(null);

      if (sortKey === 'distance') {
        setSortKey('createdAt');
        setSortDir('desc');
      }
    }
  };

  const handleLocationSelect = (_, result) => {
    markInteracted();
    if (!result) {
      setSelectedLocation(null);
      setLocationQuery('');

      if (sortKey === 'distance') {
        setSortKey('createdAt');
        setSortDir('desc');
      }

      return;
    }

    setSelectedLocation(result);
    setLocationQuery(result.formatted);
  };

  const filters = useMemo(() => {
    const f = {
      q: debouncedSearch || undefined,
      category: selectedCategories.map(
        (key) => CATEGORIES.find((c) => c.key === key)?.apiValue
      ),
      urgency: selectedUrgencies.map(
        (key) => URGENCY_LEVELS.find((u) => u.key === key)?.apiValue
      ),
      daysOfWeek: selectedDays,
      sortField: sortKey,
      sortDir,
    };

    if (selectedLocation) {
      f.lat = selectedLocation.lat;
      f.lng = selectedLocation.lon;
      f.radiusMi = distance;
    } else if (sortKey === 'distance') {
      f.sortField = 'createdAt';
      f.sortDir = 'desc';
    }

    return f;
  }, [
    debouncedSearch,
    selectedCategories,
    selectedUrgencies,
    selectedDays,
    sortKey,
    sortDir,
    selectedLocation,
    distance,
  ]);

  const filtersKey = JSON.stringify(filters);
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (filtersKey !== prevFiltersKey) {
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }

  const browseFilters = useMemo(
    () => ({ ...filters, page, pageSize: PAGE_SIZE }),
    [filters, page]
  );

  const { helpRequests, meta, isLoading, isFetching, isError, error } =
    useBrowseHelpRequests(browseFilters);

  const { categoryCounts } = useCategoryFacets(filters);

  if (isLoading) {
    return (
      <Box>
        <Box>
          <Typography variant="h5">Browse Help Requests</Typography>
          <Typography variant="subtitle1" sx={{ color: COLORS.textMuted }}>
            Find a neighbor nearby who could use a hand
          </Typography>
        </Box>

        <BrowseSkeleton />
      </Box>
    );
  }

  return (
    <Box>
      <Box>
        <Typography variant="h5">Browse Help Requests</Typography>

        <Typography variant="subtitle1" sx={{ color: COLORS.textMuted }}>
          Find a neighbor nearby who could use a hand
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
        <TextField
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => {
            markInteracted();
            setSearch(e.target.value);
          }}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon />
              <span>Search by title or description</span>
            </Box>
          }
          sx={{ ...inputLabelSx, '& .MuiOutlinedInput-root': fieldSx }}
        />

        <Autocomplete
          fullWidth
          options={autocompleteResults}
          value={selectedLocation}
          inputValue={locationQuery}
          onInputChange={handleLocationInputChange}
          onChange={handleLocationSelect}
          getOptionLabel={(option) => option?.formatted ?? ''}
          isOptionEqualToValue={(option, value) =>
            option.place_id === value.place_id
          }
          loading={isAutocompleting}
          filterOptions={(options) => options}
          noOptionsText={
            locationQuery.length >= 3
              ? 'No locations found'
              : 'Type at least 3 characters'
          }
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.place_id}>
              {option.formatted}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <LocationPinIcon />
                  <span>Location</span>
                </Box>
              }
              sx={{
                ...inputLabelSx,
                '& .MuiOutlinedInput-root': fieldSx,
              }}
            />
          )}
        />

        <SortControl
          sortKey={sortKey}
          sortDir={sortDir}
          onChange={handleSortChange}
          hasLocation={!!selectedLocation}
        />
      </Stack>

      <Box
        sx={{
          mt: 4,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '32px',
        }}
      >
        <Box sx={{ width: '250px', flexShrink: 0 }}>
          <FilterSidebar
            selectedCategories={selectedCategories}
            onToggleCategory={(key) => {
              markInteracted();
              setSelectedCategories((prev) => toggleInArray(prev, key));
            }}
            categoryCounts={categoryCounts}
            selectedUrgencies={selectedUrgencies}
            onToggleUrgency={(key) => {
              markInteracted();
              setSelectedUrgencies((prev) => toggleInArray(prev, key));
            }}
            distance={distance}
            onDistanceChange={(newDistance) => {
              markInteracted();
              setDistance(newDistance);
            }}
            selectedDays={selectedDays}
            onToggleDay={(day) => {
              markInteracted();
              setSelectedDays((prev) => toggleInArray(prev, day));
            }}
            onClearAll={handleClearAll}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Stack
            direction="row"
            sx={{
              mb: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                Showing {meta?.totalCount ?? 0} open requests
              </Typography>

              {isFetching && <CircularProgress size={14} />}
            </Stack>

            <ButtonGroup size="small">
              <Button
                onClick={() => setView('list')}
                variant={view === 'list' ? 'contained' : 'outlined'}
                sx={viewToggleSx(view === 'list')}
              >
                List
              </Button>

              <Button
                onClick={() => setView('map')}
                variant={view === 'map' ? 'contained' : 'outlined'}
                sx={viewToggleSx(view === 'map')}
              >
                Map
              </Button>
            </ButtonGroup>
          </Stack>

          {isError ? (
            <Alert severity="error">
              {friendlyErrorMessage(error) ||
                'Something went wrong loading help requests.'}
            </Alert>
          ) : view === 'list' ? (
            helpRequests.length > 0 ? (
              <>
                {helpRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}

                {meta?.totalPages > 1 && (
                  <Stack sx={{ mt: 3, alignItems: 'center' }}>
                    <Pagination
                      page={page}
                      count={meta.totalPages}
                      onChange={(_, value) => {
                        markInteracted();
                        setPage(value);
                      }}
                      color="primary"
                    />
                  </Stack>
                )}
              </>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: COLORS.textFaint, mt: 4 }}
              >
                No requests match your filters right now.
              </Typography>
            )
          ) : (
            <Box
              sx={{
                border: '1px dashed',
                borderColor: COLORS.border,
                borderRadius: 2,
                p: 6,
                textAlign: 'center',
                color: COLORS.textFaint,
              }}
            >
              Map view coming soon.
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Browse;
