import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { getUserById, updateUserVolunteerById } from '../../services/adminApi';
import VolunteerPreferencesForm from '../../components/profile/VolunteerPreferencesForm';
import VolunteerPreferencesView from '../../components/profile/VolunteerPreferencesView';
import ProfileSection from '../../components/profile/ProfileSection';

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function DetailRow({ label, value }) {
  return (
    <Typography variant="body2" sx={{ mb: 0.75 }}>
      <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
        {label}
      </Box>
      {value || 'N/A'}
    </Typography>
  );
}

function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditingVolunteer, setIsEditingVolunteer] = useState(false);

  const {
    data: selectedUser,
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => getUserById(id),
    enabled: Boolean(id),
    retry: false,
  });

  const volunteer = selectedUser?.volunteer;
  const showVolunteer =
    Boolean(volunteer) || selectedUser?.role === 'VOLUNTEER';

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      updateUserVolunteerById(id, payload, user?.csrfToken),
    onSuccess: (data) => {
      queryClient.setQueryData(['adminUser', id], (current) =>
        current ? { ...current, volunteer: data } : current
      );
      setIsEditingVolunteer(false);
    },
  });

  if (isLoadingUser) {
    return <CircularProgress color="success" />;
  }

  if (isUserError) {
    return (
      <Alert severity="error">
        {userError?.response?.data?.message || 'Failed to load user.'}
      </Alert>
    );
  }

  const requesterProfile = selectedUser?.requesterProfile;

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

      <ProfileSection title="Account">
        <DetailRow label="Email" value={selectedUser?.email} />
        <DetailRow label="Role" value={selectedUser?.role} />
        <DetailRow label="Phone" value={selectedUser?.phone} />
        <DetailRow label="Gender" value={selectedUser?.gender} />
        <DetailRow label="Date of birth" value={formatDate(selectedUser?.dob)} />
      </ProfileSection>

      {selectedUser?.role === 'REQUESTER' && (
        <ProfileSection title="Requester profile">
          {requesterProfile ? (
            <>
              <DetailRow label="City" value={requesterProfile.city} />
              <DetailRow label="Address" value={requesterProfile.address} />
              <DetailRow label="Bio" value={requesterProfile.bio} />
              <DetailRow
                label="Emergency contact"
                value={requesterProfile.emergencyContact}
              />
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No requester profile on file.
            </Typography>
          )}
        </ProfileSection>
      )}

      {showVolunteer && (
        <ProfileSection title="Volunteer profile">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Interests, availability, and service area.
            </Typography>
            {!isEditingVolunteer && volunteer && (
              <IconButton
                aria-label="Edit volunteer profile"
                onClick={() => setIsEditingVolunteer(true)}
                sx={{ color: '#8C8164' }}
              >
                <EditOutlinedIcon />
              </IconButton>
            )}
          </Box>

          {!volunteer && !isEditingVolunteer && (
            <Alert severity="info">
              No volunteer profile on file for this user.
            </Alert>
          )}

          {saveMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveMutation.error?.response?.data?.message ||
                saveMutation.error?.response?.data?.error ||
                'Failed to save volunteer profile.'}
            </Alert>
          )}

          {isEditingVolunteer ? (
            <VolunteerPreferencesForm
              key={id}
              initialPreferences={volunteer}
              isSaving={saveMutation.isPending}
              onCancel={() => setIsEditingVolunteer(false)}
              onSave={(payload) => saveMutation.mutateAsync(payload)}
            />
          ) : (
            volunteer && <VolunteerPreferencesView preferences={volunteer} />
          )}
        </ProfileSection>
      )}
    </Box>
  );
}

export default AdminUserDetailPage;
