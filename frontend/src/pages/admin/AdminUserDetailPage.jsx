import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import CakeIcon from '@mui/icons-material/Cake';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useAdminUserProfileImage } from '../../hooks/admin/useAdminUserProfileImage';
import { getUserById, updateUserVolunteerById } from '../../services/adminApi';
import VolunteerPreferencesForm from '../../components/profile/VolunteerPreferencesForm';
import VolunteerPreferencesView from '../../components/profile/VolunteerPreferencesView';
import ProfileSection from '../../components/profile/ProfileSection';
import ProfileField from '../../components/requesterProfile/ProfileField';

const ROLE_LABELS = {
  ADMIN: 'Admin',
  REQUESTER: 'Requester',
  VOLUNTEER: 'Volunteer',
};

const VERIFICATION_COLORS = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
};

function formatDate(value) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not provided';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function displayValue(value) {
  return value?.trim() || 'Not provided';
}

function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  const { data: profileImageUrl } = useAdminUserProfileImage(id);

  const volunteer = selectedUser?.volunteer;
  const showVolunteer =
    Boolean(volunteer) || selectedUser?.role === 'VOLUNTEER';
  const requesterProfile = selectedUser?.requesterProfile;
  const roleLabel = ROLE_LABELS[selectedUser?.role] ?? selectedUser?.role;

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

  const fromPendingVolunteers =
    searchParams.get('from') === 'pending-volunteers';

  const handleBack = () => {
    if (fromPendingVolunteers) {
      navigate('/admin/volunteers');
    } else {
      navigate('/admin/users');
    }
  };

  if (isLoadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress color="success" aria-label="Loading user profile" />
      </Box>
    );
  }

  if (isUserError) {
    return (
      <Alert severity="error">
        {userError?.response?.data?.message || 'Failed to load user.'}
      </Alert>
    );
  }

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>
        User Profile
      </Typography>
      <Box
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: 3,
          p: { xs: 3, sm: 4, md: 5 },
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
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {selectedUser?.name}
          </Typography>
          <Button variant="contained" onClick={handleBack}>
            Back
          </Button>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'center', sm: 'flex-start' },
            mb: 3,
            pb: 3,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Avatar
            src={profileImageUrl || undefined}
            alt={selectedUser?.name}
            sx={{
              width: 88,
              height: 88,
              bgcolor: 'primary.main',
              fontSize: 32,
            }}
          >
            {selectedUser?.name?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 1,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                gap: 1,
              }}
            >
              <Chip label={roleLabel} size="small" color="primary" />
              {volunteer?.verificationStatus && (
                <Chip
                  label={volunteer.verificationStatus}
                  size="small"
                  color={
                    VERIFICATION_COLORS[volunteer.verificationStatus] ||
                    'default'
                  }
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Member since {formatDate(selectedUser?.createdAt)}
            </Typography>
          </Box>
        </Stack>

        <ProfileSection title="Account information">
          <Stack spacing={2}>
            <ProfileField
              icon={<EmailOutlinedIcon />}
              label="Email"
              value={displayValue(selectedUser?.email)}
            />
            <ProfileField
              icon={<PhoneOutlinedIcon />}
              label="Phone"
              value={displayValue(selectedUser?.phone)}
            />
            <ProfileField
              icon={<CakeIcon />}
              label="Date of birth"
              value={formatDate(selectedUser?.dob)}
            />
            <ProfileField
              icon={<DescriptionOutlinedIcon />}
              label="Gender"
              value={displayValue(selectedUser?.gender)}
            />
          </Stack>
        </ProfileSection>

        {selectedUser?.role === 'REQUESTER' && (
          <ProfileSection title="Requester profile">
            {requesterProfile ? (
              <Stack spacing={2}>
                <ProfileField
                  icon={<LocationCityOutlinedIcon />}
                  label="City"
                  value={displayValue(requesterProfile.city)}
                />
                <ProfileField
                  icon={<HomeOutlinedIcon />}
                  label="Address"
                  value={displayValue(requesterProfile.address)}
                />
                <ProfileField
                  icon={<DescriptionOutlinedIcon />}
                  label="Bio"
                  value={displayValue(requesterProfile.bio)}
                />
                <ProfileField
                  icon={<ContactPhoneOutlinedIcon />}
                  label="Emergency contact"
                  value={displayValue(requesterProfile.emergencyContact)}
                />
              </Stack>
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
                mb: 2,
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
    </>
  );
}

export default AdminUserDetailPage;
