import { Stack, TextField, MenuItem, Tooltip, IconButton } from '@mui/material';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { SORT_FIELDS, DIR_LABELS } from '../../utils/browse.constants';
import { COLORS } from '../../utils/constants';

function SortControl({ sortKey, sortDir, onChange, hasLocation }) {
  const fieldSx = {
    backgroundColor: COLORS.bgSubtle,
    '& fieldset': { borderColor: COLORS.border },
    '&:hover fieldset': { borderColor: COLORS.borderHover },
    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
  };

  const inputLabelSx = {
    '& .MuiInputLabel-root': { color: COLORS.textFaint },
    '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
  };

  const fields = SORT_FIELDS.filter(
    (f) => f.requires !== 'location' || hasLocation
  );

  const handleFieldChange = (e) => {
    const newKey = e.target.value;
    const field = fields.find((f) => f.key === newKey);
    onChange(newKey, field.defaultDir);
  };

  const handleDirToggle = () => {
    onChange(sortKey, sortDir === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Stack direction="row" spacing={1}>
      <TextField
        select
        variant="outlined"
        value={sortKey}
        onChange={handleFieldChange}
        sx={{
          minWidth: 200,
          ...inputLabelSx,
          '& .MuiOutlinedInput-root': fieldSx,
          '& .MuiSelect-select': { color: COLORS.textFaint },
        }}
      >
        {fields.map((f) => (
          <MenuItem key={f.key} value={f.key}>
            {f.label}
          </MenuItem>
        ))}
      </TextField>

      <Tooltip title={DIR_LABELS[sortKey][sortDir]}>
        <IconButton
          onClick={handleDirToggle}
          sx={{
            ...fieldSx,
            border: '1px solid',
            borderColor: COLORS.border,
            borderRadius: 1,
            color: COLORS.textFaint,
            '&:hover': {
              backgroundColor: COLORS.bgSubtle,
              borderColor: COLORS.borderHover,
              color: 'primary.main',
            },
          }}
        >
          {sortDir === 'asc' ? (
            <ArrowUpward fontSize="small" />
          ) : (
            <ArrowDownward fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

export default SortControl;
