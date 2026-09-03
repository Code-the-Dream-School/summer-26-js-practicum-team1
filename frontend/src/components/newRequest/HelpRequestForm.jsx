import { Box, MenuItem, TextField, Typography } from '@mui/material';

function HelpRequestForm({
  formData,
  fieldErrors,
  onChange,
  categories,
  urgencies,
}) {
  return (
    <>
      {/* WHAT DO YOU NEED HELP WITH? */}

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

      {/* REQUEST TITLE */}

      <TextField
        fullWidth
        required
        label="Request Title"
        name="title"
        value={formData.title}
        onChange={onChange}
        placeholder="What help do you need?"
        slotProps={{
  htmlInput: {
          maxLength: 100,
         },
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

      {/* CATEGORY + URGENCY */}

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
        {/* CATEGORY */}

        <TextField
          select
          fullWidth
          required
          label="Category"
          name="category"
          value={formData.category}
          onChange={onChange}
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
          {(categories || []).map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>

        {/* URGENCY */}

        <TextField
          select
          fullWidth
          required
          label="Urgency"
          name="urgency"
          value={formData.urgency}
          onChange={onChange}
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
          {(urgencies || []).map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* WHEN DO YOU NEED HELP? */}

      <Typography
        variant="h6"
        fontWeight={600}
        sx={{
          color: '#1F2937',
          mb: 2.5,
        }}
      >
        When do you need help?
      </Typography>

      {/* DATE + TIME */}

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
        {/* DATE */}

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
            Date <span style={{ color: '#d32f2f' }}>*</span>
          </Typography>

          <TextField
            id="date"
            fullWidth
            type="date"
            name="date"
            value={formData.date}
            onChange={onChange}
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

        {/* TIME */}

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
            Time <span style={{ color: '#d32f2f' }}>*</span>
          </Typography>

          <TextField
            id="time"
            fullWidth
            type="time"
            name="time"
            value={formData.time}
            onChange={onChange}
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

      {/* DESCRIPTION */}

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
        onChange={onChange}
        multiline
        minRows={4}
        placeholder="Describe the help you need..."
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
    </>
  );
}

export default HelpRequestForm;
