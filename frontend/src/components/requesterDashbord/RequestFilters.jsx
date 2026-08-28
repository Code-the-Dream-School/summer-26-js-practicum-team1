
import {
  Box,
  Button,
  ButtonGroup,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import { COLORS } from '../../utils/browse.constants.js';

 function RequestFilters({
  search,
  setSearch,
  filter,
  setFilter,
  sortBy,
  setSortBy,
  onNewRequest,
}) {
  return (
    <Stack
      direction={{
        xs: 'column',
        md: 'row',
      }}
      spacing={2}
      sx={{
        mt: 2,
        mb: 3,
        alignItems: {
          xs: 'stretch',
          md: 'center',
        },
      }}
    >
      {/* SEARCH */}

      <TextField
        variant="outlined"
        fullWidth
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <SearchIcon fontSize="small" />

            <span>
              Search your requests
            </span>
          </Box>
        }
        placeholder="Search by title or description"
        sx={{
          '& .MuiInputLabel-root': {
            color: COLORS.textFaint,
          },

          '& .MuiInputLabel-root.Mui-focused': {
            color: COLORS.primary,
          },

          '& .MuiOutlinedInput-root': {
          backgroundColor: '#fff',

            '& fieldset': {
              borderColor: COLORS.border,
            },

           '&:hover fieldset': {
            borderColor:
              COLORS.borderHover,
          },

            '&.Mui-focused fieldset': {
              borderColor: COLORS.primary,
            },
          },
        }}
      />

      {/* STATUS FILTER */}

      <ButtonGroup
        size="small"
        sx={{
          flexShrink: 0,
        }}
      >
        {[
          'ALL',
          'PENDING',
          'ACCEPTED',
        ].map((key) => (
          <Button
            key={key}
            onClick={() =>
              setFilter(key)
            }
            variant={
              filter === key
                ? 'contained'
                : 'outlined'
            }
            sx={{
              minHeight: 44,
              px: 2,
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap',

              backgroundColor:
                filter === key
                  ? COLORS.primary
                  : 'transparent',

              borderColor:
                COLORS.border,

              color:
                filter === key
                  ? '#FFFFFF'
                  : COLORS.textMuted,

              '&:hover': {
                backgroundColor:
                  filter === key
                    ? COLORS.primaryHover
                    : COLORS.bgSubtle,
              },
            }}
          >
            {key.charAt(0) +
              key
                .slice(1)
                .toLowerCase()}
          </Button>
        ))}
      </ButtonGroup>

      {/* SORT */}

      <Select
        value={sortBy}
        onChange={(event) =>
          setSortBy(event.target.value)
        }
        size="small"
        sx={{
          minWidth: 180,
          minHeight: 44,
           backgroundColor: '#fff',

          '& fieldset': {
            borderColor: COLORS.border,
          },

          '&:hover fieldset': {
            borderColor:
              COLORS.borderHover,
          },
        }}
      >
        <MenuItem value="SOONEST">
   Earliest First
</MenuItem>

        <MenuItem value="URGENCY">
          Sort: urgency
        </MenuItem>
      </Select>

      {/* NEW REQUEST */}

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onNewRequest}
        sx={{
          minHeight: 44,
          minWidth: 160,
          px: 2,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 700,
          whiteSpace: 'nowrap',

         backgroundColor: '#2E7D32',

          '&:hover': {
            backgroundColor: '#1B5E20',
          },
        }}
      >
        New Request
      </Button>
    </Stack>
  );
}
export default RequestFilters;
