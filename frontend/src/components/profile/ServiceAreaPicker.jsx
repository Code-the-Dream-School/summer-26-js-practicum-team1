import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import { hasGeoapifyKey, searchServiceAreas } from '../../services/geoapify';

function ServiceAreaPicker({ value, onChange }) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const keyConfigured = useMemo(() => hasGeoapifyKey(), []);

  useEffect(() => {
    if (!keyConfigured) {
      return undefined;
    }

    const query = inputValue.trim();
    if (query.length < 2) {
      setOptions([]);
      setIsSearching(false);
      return undefined;
    }

    let cancelled = false;
    setIsSearching(true);
    setSearchError('');

    const timer = setTimeout(async () => {
      try {
        const results = await searchServiceAreas(query);
        if (!cancelled) {
          setOptions(results);
        }
      } catch (error) {
        if (!cancelled) {
          setOptions([]);
          setSearchError('Could not search locations. Try again.');
          console.error(error);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inputValue, keyConfigured]);

  const selected = value?.label
    ? {
        label: value.label,
        latitude: value.latitude,
        longitude: value.longitude,
      }
    : null;

  if (!keyConfigured) {
    return (
      <Alert severity="warning">
        Add `VITE_GEOAPIFY_API_KEY` to the frontend `.env` to enable location
        search. Free-text service areas are disabled so matches stay stable.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Search and select a place. We store coordinates so matching stays
        reliable.
      </Typography>

      {selected ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <PlaceOutlinedIcon color="primary" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {selected.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
            </Typography>
          </Box>
          <IconButton
            aria-label="Clear service area"
            size="small"
            onClick={() => {
              onChange(null);
              setInputValue('');
              setOptions([]);
            }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Autocomplete
          options={options}
          loading={isSearching}
          filterOptions={(x) => x}
          getOptionLabel={(option) => option.label || ''}
          isOptionEqualToValue={(a, b) =>
            a.latitude === b.latitude && a.longitude === b.longitude
          }
          inputValue={inputValue}
          onInputChange={(_event, next, reason) => {
            if (reason !== 'reset') {
              setInputValue(next);
            }
          }}
          onChange={(_event, option) => {
            if (!option) {
              onChange(null);
              return;
            }
            onChange({
              label: option.label,
              latitude: option.latitude,
              longitude: option.longitude,
            });
            setInputValue('');
            setOptions([]);
          }}
          noOptionsText={
            inputValue.trim().length < 2
              ? 'Type at least 2 characters'
              : 'No places found'
          }
          renderOption={(props, option) => (
            <li {...props} key={`${option.latitude}-${option.longitude}-${option.label}`}>
              <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.5 }}>
                <Typography variant="body2">{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.latitude.toFixed(4)}, {option.longitude.toFixed(4)}
                </Typography>
              </Box>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search city, neighborhood, or zip"
              placeholder="Start typing a place…"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <PlaceOutlinedIcon
                      fontSize="small"
                      sx={{ ml: 1, mr: 0.5, color: 'text.secondary' }}
                    />
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {isSearching ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )}

      {searchError && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {searchError}
        </Alert>
      )}

      {!selected && (
        <Box sx={{ mt: 1.5 }}>
          <Chip
            size="small"
            variant="outlined"
            label="Pick from search results only"
            sx={{ borderRadius: 1 }}
          />
        </Box>
      )}
    </Box>
  );
}

export default ServiceAreaPicker;
