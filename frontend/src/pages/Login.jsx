import { useForm } from 'react-hook-form';
import { Box, TextField, Typography, Button, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
    <>
      <Typography variant="h4" gutterBottom>
        Login
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
          fullWidth
          margin="normal"
          autoComplete="current-password"
          {...register('password', { required: 'Password is required' })}
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{ formHelperText: { id: 'password-error' } }}
          aria-describedby={errors.password ? 'password-error' : undefined}
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
          sx={{ mt: 2 }}
        >
          Log In
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to={'/'}
          fullWidth
          sx={{ mt: 2 }}
        >
          Don't have an account? Sign up
        </Button>
      </Box>
    </>
  );
}

export default Login;
