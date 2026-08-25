import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Stack,
  Button,
  Slider,
  Tooltip,
} from '@mui/material';
import {
  DEFAULT_DISTANCE_MI,
  COLORS,
  CATEGORIES,
  URGENCY_LEVELS,
  DAYS_OF_WEEK,
} from '../../utils/browse.constants';

function FilterSidebar({
  selectedCategories,
  onToggleCategory,
  categoryCounts,
  selectedUrgencies,
  onToggleUrgency,
  distance,
  onDistanceChange,
  selectedDays,
  onToggleDay,
  onClearAll,
}) {
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedUrgencies.length > 0 ||
    selectedDays.length > 0 ||
    distance !== DEFAULT_DISTANCE_MI;

  return (
    <Box
      sx={{
        backgroundColor: COLORS.bgSubtle,
        border: '1px solid',
        borderColor: COLORS.border,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ color: COLORS.textMuted, fontWeight: 700 }}
      >
        Filters
      </Typography>

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Category
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {CATEGORIES.map((cat) => (
          <FormControlLabel
            key={cat.key}
            sx={{
              alignItems: 'center',
              m: 0,
              p: 0.5,
              '& .MuiFormControlLabel-label': { flex: 1 },
            }}
            control={
              <Checkbox
                size="small"
                checked={selectedCategories.includes(cat.key)}
                onChange={() => onToggleCategory(cat.key)}
                sx={{ p: 0, mr: 0.5 }}
              />
            }
            label={
              <Stack
                direction="row"
                sx={{
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2">{cat.label}</Typography>
                <Typography variant="body2" sx={{ color: COLORS.textFaint }}>
                  {categoryCounts[cat.apiValue] || 0}
                </Typography>
              </Stack>
            }
          />
        ))}
      </Box>

      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        Urgency
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
        {URGENCY_LEVELS.map((level) => {
          const active = selectedUrgencies.includes(level.key);
          return (
            <Button
              key={level.key}
              onClick={() => onToggleUrgency(level.key)}
              size="small"
              variant="outlined"
              startIcon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: 8,
                    backgroundColor: level.color,
                  }}
                />
              }
              sx={{
                textTransform: 'none',
                borderRadius: 5,
                borderColor: active ? level.color : COLORS.border,
                color: active ? level.color : 'text.primary',
                backgroundColor: active ? `${level.color}14` : 'transparent',
                '&:hover': {
                  borderColor: level.color,
                  backgroundColor: `${level.color}14`,
                },
              }}
            >
              {level.label}
            </Button>
          );
        })}
      </Stack>

      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        Distance
      </Typography>
      <Box sx={{ px: 0.5 }}>
        <Slider
          value={distance}
          size="small"
          min={1}
          max={25}
          onChange={(_, val) => onDistanceChange(val)}
        />
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
            Within
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
            {distance} miles
          </Typography>
        </Stack>
      </Box>

      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        Availability
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', gap: '4px' }}>
        {DAYS_OF_WEEK.map(({ short, full, day }) => {
          const active = selectedDays.includes(day);
          return (
            <Tooltip key={day} title={full}>
              <Box
                component="button"
                onClick={() => onToggleDay(day)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '1px solid',
                  borderColor: active ? 'primary.main' : COLORS.border,
                  backgroundColor: active ? 'primary.main' : '#fff',
                  color: active ? '#fff' : 'text.primary',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0,
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: active ? 'primary.main' : COLORS.bgSubtle,
                  },
                }}
              >
                {short}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      <Typography
        variant="caption"
        sx={{ color: COLORS.textFaint, mt: 0.5, display: 'block' }}
      >
        Requests with a flexible schedule always show, regardless of day.
      </Typography>

      <Button
        fullWidth
        onClick={onClearAll}
        disabled={!hasActiveFilters}
        sx={{
          mt: 3,
          textTransform: 'none',
          color: COLORS.textMuted,
          backgroundColor: '#EDEDEA',
          '&:hover': { backgroundColor: COLORS.border },
        }}
      >
        Clear all filters
      </Button>
    </Box>
  );
}

export default FilterSidebar;
