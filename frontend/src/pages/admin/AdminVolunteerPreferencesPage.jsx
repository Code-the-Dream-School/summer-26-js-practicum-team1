import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import {
  getVolunteerPreferencesById,
  updateVolunteerPreferencesById,
} from '../../services/adminApi';
import VolunteerPreferencesForm from '../../components/profile/VolunteerPreferencesForm';

function AdminVolunteerPreferencesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['adminVolunteerPreferences', id],
    queryFn: () => getVolunteerPreferencesById(id),
    enabled: Boolean(id),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      updateVolunteerPreferencesById(id, payload, user?.csrfToken),
    onSuccess: (data) => {
      queryClient.setQueryData(['adminVolunteerPreferences', id], data);
    },
  });

  if (isLoading) {
    return <CircularProgress color="success" />;
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.response?.data?.message || 'Failed to load volunteer preferences.'}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '24px',
        p: { xs: 3, sm: 4 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Edit volunteer preferences
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/admin/users')}>
          Back to users
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manager edit for volunteer #{id}
      </Typography>

      {saveMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveMutation.error?.response?.data?.message ||
            'Failed to save preferences.'}
        </Alert>
      )}

      <VolunteerPreferencesForm
        key={JSON.stringify(preferences)}
        initialPreferences={preferences}
        isSaving={saveMutation.isPending}
        onSave={async (payload) => {
          await saveMutation.mutateAsync(payload);
          navigate('/admin/users');
        }}
      />
    </Box>
  );
}

export default AdminVolunteerPreferencesPage;
