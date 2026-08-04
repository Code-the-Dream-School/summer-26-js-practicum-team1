import { Box, Typography, Button, Card, CardActionArea, Chip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ElderlyIcon from '@mui/icons-material/Elderly';
import logo from '../assets/logo.png';

// Role options shown as cards on the signup screen. `path` is where the
// role card navigates on click.
const ROLES = [
  {
    key: 'volunteer',
    label: 'I Can Help (As a Volunteer)',
    description: 'Offer your time to support neighbors in your community.',
    icon: VolunteerActivismIcon,
    path: '/register/volunteer',
  },
  {
    key: 'requester',
    label: 'I Need Help (An Older Adult)',
    description: 'Request assistance from volunteers near you.',
    icon: ElderlyIcon,
    path: '/register/requester',
    // TODO: this flow isn't scoped/built yet. Confirm with teammate/PM
    // whether it's a stub, in progress, or a separate future ticket, then
    // remove `disabled` and give it a real destination.
    disabled: true,
  },
];

function RoleCard({ label, description, icon, onClick, disabled }) {
  const Icon = icon;
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: '16px', position: 'relative', opacity: disabled ? 0.6 : 1 }}
    >
      {disabled && (
        <Chip
          label="Coming soon"
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12 }}
        />
      )}
      <CardActionArea
        onClick={onClick}
        disabled={disabled}
        aria-disabled={disabled}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          '&:hover': {
            backgroundColor: 'secondary.main',
          },
        }}
      >
        <Icon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'center' }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {description}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

function SignupPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 6, sm: 8, md: 10 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: 400, sm: 560, md: 640 },
          bgcolor: 'background.paper',
          borderRadius: '24px',
          p: { xs: 3, sm: 4, md: 5 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 4,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Neighborhood Helper Logo"
            sx={{ width: 25, height: 25 }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Neighborhood Helper
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
            mb: 4,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Create an account
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              color="primary"
              disableElevation
            >
              Login
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {ROLES.map(({ key, label, description, icon, path, disabled }) => (
            <RoleCard
              key={key}
              label={label}
              description={description}
              icon={icon}
              disabled={disabled}
              onClick={() => navigate(path)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default SignupPage;
