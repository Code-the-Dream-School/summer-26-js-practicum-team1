import { useForm } from 'react-hook-form';
import {
  Box,
  TextField,
  Typography,
  Button,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GoogleIcon from '@mui/icons-material/Google';

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Your account has been locked. Please try again later',
  NETWORK_ERROR: 'Something went wrong. Please try again',
};

const ROLE_REDIRECTS = {
  requester: '/',
  volunteer: '/',
  admin: '/',
};

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, loginError, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    try {
      const data = await login(formData);
      navigate(ROLE_REDIRECTS[data.role] ?? '/');
    } catch (err) {
      console.error(err);
    }
  };

  const errorMessage =
    loginError &&
    (ERROR_MESSAGES[loginError.message] ?? ERROR_MESSAGES.NETWORK_ERROR);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', px: 2 }}>
      <Typography
        variant="h4"
        sx={{ textAlign: 'center', fontWeight: 700, letterSpacing: 1, mb: 4 }}
        gutterBottom
      >
        WELCOME
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ mt: 2 }}
        noValidate
      >
        <TextField
          label="Email"
          type="email"
          variant="standard"
          fullWidth
          margin="normal"
          autoComplete="email"
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
        <TextField
          label="Password"
          type="password"
          variant="standard"
          fullWidth
          margin="normal"
          autoComplete="current-password"
          {...register('password', { required: 'Password is required' })}
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{ formHelperText: { id: 'password-error' } }}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />

        <FormControlLabel
          sx={{ mt: 2 }}
          control={<Checkbox {...register('recaptcha')} />}
          label="Recaptcha"
        />

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoggingIn}
          loading={isLoggingIn}
          sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
        >
          Login
        </Button>

        <Button
          type="button"
          variant="contained"
          color="charcoal"
          fullWidth
          disabled={isLoggingIn}
          startIcon={<GoogleIcon />}
          sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
        >
          Google Login
        </Button>

        <Button
          variant="contained"
          color="olive"
          component={Link}
          to="/signup"
          fullWidth
          sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
        >
          Don't have an account? Signup
        </Button>
      </Box>
    </Box>
  );
}

export default Login;
