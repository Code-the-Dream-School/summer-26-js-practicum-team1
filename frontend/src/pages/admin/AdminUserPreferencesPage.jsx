import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/admin/useUsers';
import {
  getUserPreferencesById,
  updateUserPreferencesById,
} from '../../services/adminApi';
import VolunteerPreferencesForm from '../../components/profile/VolunteerPreferencesForm';
import ProfileSection from '../../components/profile/ProfileSection';

function AdminUserPreferencesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: usersData } = useUsers();

  const selectedUser = usersData?.users?.find(
    (entry) => String(entry.id) === String(id)
  );

  const {
    data: preferences,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['adminUserPreferences', id],
    queryFn: () => getUserPreferencesById(id),
    enabled: Boolean(id),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      updateUserPreferencesById(id, payload, user?.csrfToken),
    onSuccess: (data) => {
      queryClient.setQueryData(['adminUserPreferences', id], data);
    },
  });

  if (isLoading) {
    return <CircularProgress color="success" />;
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.response?.data?.message ||
          'Failed to load volunteer preferences.'}
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
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#52462A' }}>
          {selectedUser?.name || `User #${id}`}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/admin/users')}>
          Back to users
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {selectedUser?.email || `User #${id}`}
        {selectedUser?.role ? ` · ${selectedUser.role}` : ''}
      </Typography>

      <ProfileSection title="Volunteer preferences">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manager edit for this volunteer’s interests, availability, and service
          area.
        </Typography>

        {saveMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveMutation.error?.response?.data?.message ||
              'Failed to save preferences.'}
          </Alert>
        )}

        <VolunteerPreferencesForm
          key={id}
          initialPreferences={preferences}
          isSaving={saveMutation.isPending}
          onCancel={() => navigate('/admin/users')}
          onSave={async (payload) => {
            await saveMutation.mutateAsync(payload);
            navigate('/admin/users');
          }}
        />
      </ProfileSection>
    </Box>
  );
}

export default AdminUserPreferencesPage;
