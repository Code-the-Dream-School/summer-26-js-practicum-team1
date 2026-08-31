import {
  IconButton,
  Typography,
  Card,
  CardHeader,
  Avatar,
  CardActions,
  Button,
  Divider,
  Chip,
  Stack,
} from '@mui/material';

import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import { useAdminUserProfileImage } from '../../hooks/admin/useAdminUserProfileImage';
import { useNavigate } from 'react-router-dom';
import { grey } from '@mui/material/colors';
import { useApproveVolunteer } from '../../hooks/admin/useApproveVolunteer';
import { useRejectVolunteer } from '../../hooks/admin/useRejectVolunteer';

function VolunteerCard({ userId, name, email, status, phone, dob, gender }) {
  const navigate = useNavigate();

  const approveMutation = useApproveVolunteer();
  const rejectMutation = useRejectVolunteer();
  const { data: profileImageUrl } = useAdminUserProfileImage(userId);
  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: 3,
        boxShadow: 3,
        bgcolor: grey[100],
      }}
    >
      <CardHeader
        avatar={
          <IconButton
            onClick={() =>
              navigate(`/admin/users/${userId}?from=pending-volunteers`)
            }
            aria-label={`View ${name}'s profile`}
            sx={{
              p: 0,
              borderRadius: '50%',
            }}
          >
            <Avatar
              src={profileImageUrl || undefined}
              alt={name}
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
                transition: '0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 3,
                },
              }}
            >
              {name?.charAt(0)}
            </Avatar>
          </IconButton>
        }

        title={<Typography variant="h5">{name}</Typography>}

        action={
          <Chip
            label={status}
            sx={{ backgroundColor: '#C1791E', color: '#fff' }}
            size="small"
          />
        }
        subheader={
          <Stack
            spacing={{ xs: 1.5, sm: 3 }}
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ mt: 1 }}
          >
            {[
              {
                icon: (
                  <LocalPhoneIcon color="warning" sx={{ fontSize: '1.1rem' }} />
                ),
                value: phone,
              },
              {
                icon: <EmailIcon color="primary" sx={{ fontSize: '1.1rem' }} />,
                value: email,
              },
              {
                icon: <CakeIcon color="error" sx={{ fontSize: '1.1rem' }} />,
                value: dob
                  ? new Date(dob).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A',
              },
              { icon: <WcIcon sx={{ fontSize: '1.1rem' }} />, value: gender },
            ].map((item, index) => (
              <Typography
                key={index}
                variant="body2"
                color="text.secondary"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                {item.icon}
                {item.value}
              </Typography>
            ))}
          </Stack>
        }
      />
      <Divider />

      <CardActions sx={{ gap: 2, p: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() =>
            navigate(`/admin/users/${userId}?from=pending-volunteers`)
          }
          sx={{
            boxShadow: 3,
            transition: '0.3s',
            '&:hover': {
              boxShadow: 8,
              transform: 'translateY(-4px)',
            },
          }}
        >
          View Profile
        </Button>

        <Stack direction="row" spacing={2}>
          <Button
            color="primary"
            variant="contained"

            onClick={() => approveMutation.mutate(userId)}

            sx={{
              boxShadow: 3,
              transition: '0.3s',

              '&:hover': {
                boxShadow: 8,
                transform: 'translateY(-4px)',
              },
            }}
          >
            Approve
          </Button>

          <Button
            color="error"
            variant="contained"

            onClick={() => rejectMutation.mutate(userId)}
            sx={{
              boxShadow: 3,
              transition: '0.3s',
              '&:hover': {
                boxShadow: 8,
                transform: 'translateY(-4px)',
              },
            }}
          >
            Reject
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
export default VolunteerCard;
