import { useForm } from 'react-hook-form';
import {
  Box,
  TextField,
  Typography,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';
import { GoogleLogin } from '@react-oauth/google';

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Your account has been locked. Please try again later',
  NETWORK_ERROR: 'Something went wrong. Please try again',
};

const ROLE_REDIRECTS = {
  requester: '/requester-dashboard',
  volunteer: '/',
  admin: '/admin/dashboard',
};

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const {
    login,
    loginError,
    isLoggingIn,
    googleLogin,
    googleLoginError,
    isGoogleLoggingIn,
  } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await googleLogin(credentialResponse.credential);

      navigate(ROLE_REDIRECTS[data.role?.toLowerCase()] ?? '/');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  const onSubmit = async (formData) => {
    try {
      const data = await login(formData);

      navigate(ROLE_REDIRECTS[data.role?.toLowerCase()] ?? '/');
    } catch (err) {
      console.error(err);
    }
  };

  const errorMessage =
    loginError &&
    (ERROR_MESSAGES[loginError.message] ?? ERROR_MESSAGES.NETWORK_ERROR);

  const googleErrorMessage = googleLoginError
    ? googleLoginError.status === 404
      ? 'No account exists with this Google email. Please sign up first.'
      : googleLoginError.status === 409
        ? 'This account is linked to a different Google account.'
        : googleLoginError.status === 401
          ? 'Google authentication failed. Please try again.'
          : googleLoginError.message === 'NETWORK_ERROR'
            ? 'Something went wrong. Please try again.'
            : 'Unable to sign in with Google. Please try again.'
    : null;

  const isLoginLoading = isLoggingIn || isGoogleLoggingIn;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 6, sm: 8, md: 10 },
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
          <Box
            component="img"
            src={logo}
            alt="Neighborhood Helper Logo"
            sx={{ width: 25, height: 25 }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Neighborhood Helper
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Welcome back
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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

          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Password
          </Typography>
          <TextField
            placeholder="Enter your password"
            type="password"
            variant="outlined"
            fullWidth
            autoComplete="current-password"
            sx={{ mb: 1 }}
            {...register('password', { required: 'Password is required' })}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{ formHelperText: { id: 'password-error' } }}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoginLoading}
            loading={isLoginLoading}
            disableElevation
            sx={{
              mt: 1,
              py: 1.3,
              fontSize: '1rem',
            }}
          >
            Login
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mx: 1.5 }}>
              or
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          {googleErrorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {googleErrorMessage}
            </Alert>
          )}

          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              '& > div': {
                width: '100%',
              },
            }}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              width="100%"
            />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', mt: 3 }}
          >
            Don&apos;t have an account?{' '}
            <Link to="/" style={{ color: 'inherit', fontWeight: 600 }}>
              <Box component="span" sx={{ color: 'primary.main' }}>
                Sign up
              </Box>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
