import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import {
  Box,
  TextField,
  Typography,
  Button,
  MenuItem,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const GENDER_OPTIONS = [
  {
    value: 'MALE',
    label: 'Male',
  },
  {
    value: 'FEMALE',
    label: 'Female',
  },
  {
    value: 'OTHER',
    label: 'Other',
  },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Something went wrong. Please try again',
  VALIDATION_FAILED: 'Please check your information and try again',
  REGISTER_FAILED: 'Registration failed. Please try again',
};

function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { register: registerAccount, registerError, isRegistering } = useAuth();

  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = async (formData) => {
    try {
      const userData = { ...formData };

      delete userData.confirmPassword;
      const response = await registerAccount(userData);

      console.log(response);

      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };
  const errorMessage =
    registerError &&
    (ERROR_MESSAGES[registerError.message] ?? ERROR_MESSAGES.REGISTER_FAILED);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '55vh',
        px: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: 400, sm: 460, md: 500 },
          bgcolor: 'background.paper',
          borderRadius: '24px',
          p: { xs: 3, sm: 4, md: 5 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 4,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Neighborhood Helper Logo"
            sx={{
              width: 25,
              height: 25,
            }}
          />

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
            }}
          >
            Neighborhood Helper
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 3,
          }}
        >
          Create account
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Full Name"
            fullWidth
            sx={{ mb: 2 }}

            {...register('name', {
              required: 'Full name is required',
            })}

            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
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
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            sx={{ mb: 2 }}

            {...register('password', {
              required: 'Password is required',

              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message:
                  'Password must include uppercase, lowercase, and a number',
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            sx={{ mb: 2 }}

            {...register('confirmPassword', {
              required: 'Confirm password is required',

              validate: (value) =>
                value === password || 'Passwords do not match',
            })}

            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          <TextField
            label="Date of Birth"
            type="date"
            fullWidth
            slotProps={{
              inputLabel: { shrink: true },
            }}
            InputLabelProps={{
              shrink: true,
            }}

            sx={{ mb: 2 }}

            {...register('dob', {
              required: 'Date of birth is required',
              validate: (value) => {
                const today = new Date();
                const birth = new Date(value);
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate()))
                  age -= 1;
                if (birth > today)
                  return 'Date of birth cannot be in the future';
                if (age < 18) return 'You must be at least 18 years old';
                if (age > 120) return 'Enter a valid date of birth';
                return true;
              },
            })}
            error={!!errors.dob}
            helperText={errors.dob?.message}
          />
          <TextField
            select
            label="Gender"
            fullWidth
            defaultValue=""
            sx={{ mb: 2 }}

            {...register('gender', {
              required: 'Gender is required',
            })}

            error={!!errors.gender}
            helperText={errors.gender?.message}
          >
            {GENDER_OPTIONS.map((gender) => (
              <MenuItem key={gender.value} value={gender.value}>
                {gender.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Phone Number"
            fullWidth
            sx={{ mb: 3 }}

            {...register('phone', {})}

            error={!!errors.phone}
            helperText={errors.phone?.message}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isRegistering}
            disableElevation
            sx={{
              py: 1.3,
              fontSize: '1rem',
            }}
          >
            {isRegistering ? 'Creating account...' : 'Register'}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"

            sx={{
              textAlign: 'center',
              mt: 3,
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'inherit',
                fontWeight: 600,
              }}
            >
              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                }}
              >
                Login
              </Box>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Register;
