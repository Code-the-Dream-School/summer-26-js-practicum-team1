import { useForm } from 'react-hook-form';
import { Box, Button, TextField } from '@mui/material';

type ContactFormValues = {
  name: string;
  email: string;
};

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>();

  const onSubmit = (data: ContactFormValues) => {
    console.log('Form submitted:', data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Name"
        {...register('name', { required: 'Name is required' })}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <TextField
        label="Email"
        type="email"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Enter a valid email',
          },
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <Button type="submit" variant="contained">
        Submit
      </Button>
    </Box>
  );
};

export default ContactForm;
