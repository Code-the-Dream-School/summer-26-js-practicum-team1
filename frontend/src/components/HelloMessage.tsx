import { Alert, CircularProgress, Typography } from '@mui/material';
import { useHello } from '../hooks/useHello';

const HelloMessage = () => {
  const { data, isLoading, isError } = useHello();

  if (isLoading) return <CircularProgress size={24} />;
  if (isError) return <Alert severity="error">Backend bağlantısı kurulamadı.</Alert>;

  return (
    <Typography>
      Message from API: <strong>{data}</strong>
    </Typography>
  );
};

export default HelloMessage;
