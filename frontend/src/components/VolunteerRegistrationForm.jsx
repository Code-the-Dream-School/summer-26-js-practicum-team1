import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  Alert,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  InputAdornment,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from 'react';

function VolunteerRegistrationForm() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = () => {
    // Intentionally not wired yet.
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordValue = watch('password');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Full Name
      </Typography>
      <TextField
        placeholder="Jane Doe"
        variant="outlined"
        fullWidth
        autoComplete="name"
        sx={{ mb: 2 }}
        {...register('name', {
          required: 'Full name is required',
          minLength: {
            value: 2,
            message: 'Name must be at least 2 characters',
          },
          maxLength: {
            value: 100,
            message: 'Name must be at most 100 characters',
          },
          pattern: {
            value: /^[\p{L}\s'-]+$/u,
            message: 'Name contains invalid characters',
          },
        })}
        error={!!errors.name}
        helperText={errors.name?.message}
        slotProps={{ formHelperText: { id: 'name-error' } }}
        aria-describedby={errors.name ? 'name-error' : undefined}
      />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 0.5, mt: 2 }}
      >
        Gender
      </Typography>
      <RadioGroup row>
        <FormControlLabel
          label="Male"
          control={
            <Radio
              value="MALE"
              {...register('gender', { required: 'Please select a gender' })}
            />
          }
        />
        <FormControlLabel
          label="Female"
          control={
            <Radio
              value="FEMALE"
              {...register('gender', { required: 'Please select a gender' })}
            />
          }
        />
        <FormControlLabel
          label="Other"
          control={
            <Radio
              value="OTHER"
              {...register('gender', { required: 'Please select a gender' })}
            />
          }
        />
        <FormControlLabel
          label="Prefer not to say"
          control={
            <Radio
              value="PREFER_NOT_TO_SAY"
              {...register('gender', { required: 'Please select a gender' })}
            />
          }
        />
      </RadioGroup>
      {errors.gender && (
        <FormHelperText error id="gender-error" sx={{ mb: 2 }}>
          {errors.gender.message}
        </FormHelperText>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          mt: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Date of Birth
          </Typography>
          <Controller
            name="dob"
            control={control}
            rules={{
              required: 'Date of birth is required',
              validate: (value) => {
                if (!value) return 'Date of birth is required';
                if (value.isAfter(dayjs()))
                  return 'Date of birth cannot be in the future';
                const age = dayjs().diff(value, 'year');
                if (age < 18) return 'You must be at least 18 years old';
                if (age > 120) return 'Enter a valid date of birth';
                return true;
              },
            }}
            render={({ field }) => (
              <DatePicker
                value={field.value ?? null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.dob,
                    helperText: errors.dob?.message,
                  },
                }}
              />
            )}
          />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Phone Number
          </Typography>
          <TextField
          placeholder='+1-123-456-7890'
            fullWidth
            autoComplete="tel"
            {...register('phone', {
              maxLength: {
                value: 20,
                message: 'Phone must be at most 20 characters',
              },
              pattern: {
                value: /^[\d\s()+-]+$/,
                message: 'Enter a valid phone number',
              },
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            slotProps={{ formHelperText: { id: 'phone-error' } }}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Email
        </Typography>
        <TextField
          placeholder="name@example.com"
          type="email"
          variant="outlined"
          fullWidth
          autoComplete="email"
          sx={{ mb: 2 }}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
          slotProps={{ formHelperText: { id: 'email-error' } }}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          mt: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Password
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              maxLength: {
                value: 72,
                message: 'Password must be at most 72 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message:
                  'Password must include uppercase, lowercase, and a number',
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              formHelperText: { id: 'password-error' },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Confirm Password
          </Typography>
          <TextField
            fullWidth
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === passwordValue || 'Passwords do not match',
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            slotProps={{
              formHelperText: { id: 'confirmPassword-error' },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label={
                        showConfirmPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            aria-describedby={
              errors.confirmPassword ? 'confirmPassword-error' : undefined
            }
          />
        </Box>
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disableElevation
        sx={{ mt: 3, py: 1.3, fontSize: '1rem' }}
      >
        Create volunteer account
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
        <Divider sx={{ flex: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mx: 1.5 }}>
          or
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Box>

      <Button
        type="button"
        variant="outlined"
        fullWidth
        disabled // Google OAuth intentionally disabled - out of scope for this ticket
        startIcon={<GoogleIcon />}
        sx={{
          py: 1.3,
          fontSize: '1rem',
          color: 'text.primary',
          borderColor: 'divider',
          bgcolor: 'white',
        }}
      >
        Continue with Google
      </Button>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center', mt: 3 }}
      >
        Do you already have an account?{' '}
        <Link to="/login" style={{ color: 'inherit', fontWeight: 600 }}>
          <Box component="span" sx={{ color: 'primary.main' }}>
            Sign in
          </Box>
        </Link>
      </Typography>

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Please fix the errors above.
        </Alert>
      )}
    </Box>
  );
}

export default VolunteerRegistrationForm;
