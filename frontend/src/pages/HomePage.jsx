import { useForm } from 'react-hook-form';
import { Box, TextField, Typography } from '@mui/material';
import HelloMessage from '../components/HelloMessage';

function HomePage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Neighborhood Helper
      </Typography>
      <HelloMessage />
      <Box
        component="form"
        onSubmit={handleSubmit(() => {})}
        sx={{ mt: 2 }}
      >
        <TextField
          label="Name"
          {...register('name', { required: 'Required' })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
      </Box>
    </>
  );
}

export default HomePage;
