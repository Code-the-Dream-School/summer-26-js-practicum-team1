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
import { useNavigate } from 'react-router-dom';
import { red, grey } from '@mui/material/colors';
import { useApproveVolunteer } from '../../hooks/admin/useApproveVolunteer';
import { useRejectVolunteer } from '../../hooks/admin/useRejectVolunteer';

function VolunteerCard({
  userId,
  name,
  email,
  status,
  phone,
  dob,
  gender,
  profileImage,
}) {
  const navigate = useNavigate();

  const approveMutation = useApproveVolunteer();
  const rejectMutation = useRejectVolunteer();
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
              src={profileImage}
              alt={name}
              sx={{
                width: 56,
                height: 56,
                bgcolor: red[500],
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

        title={<Typography variant="h6">{name}</Typography>}

        action={<Chip label={status} color="warning" size="small" />}
        subheader={
          <Stack
            spacing={3}
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            sx={{ mt: 1 }}
          >
            <Typography variant="body2">📞 {phone}</Typography>

            <Typography variant="body2">📧 {email}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              🎂{' '}
              {dob
                ? new Date(dob).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A'}
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              ⚧ {gender}
            </Typography>
          </Stack>
        }
      />
      <Divider />

      <CardActions sx={{ gap: 2, p: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() =>
            navigate(`/admin/users/${userId}?from=pending-volunteers`)
          }
          sx={{
            borderRadius: 3,
            boxShadow: 2,
            transition: '0.3s',
            '&:hover': {
              boxShadow: 5,
              transform: 'translateY(-2px)',
            },
          }}
        >
          View Profile
        </Button>

        <Stack direction="row" spacing={2}>
          <Button
            color="success"
            variant="contained"

            onClick={() => approveMutation.mutate(userId)}
            sx={{
              borderRadius: 3,
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
            variant="outlined"

            onClick={() => rejectMutation.mutate(userId)}
            sx={{
              borderRadius: 3,
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
