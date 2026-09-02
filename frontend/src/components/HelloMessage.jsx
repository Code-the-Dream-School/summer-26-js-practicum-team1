import { Alert, CircularProgress, Typography } from '@mui/material';
import { useHello } from '../hooks/useHello';

function HelloMessage() {
  const { data, isLoading, isError } = useHello();

  if (isLoading) return <CircularProgress size={24} />;
  if (isError)
    return <Alert severity="error">Could not connect to backend.</Alert>;

  return (
    <Typography>
      Message from API: <strong>{data}</strong>
    </Typography>
  );
}

export default HelloMessage;
