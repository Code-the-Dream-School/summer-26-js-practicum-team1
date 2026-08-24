import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import hero from '../assets/hero.png';
import { COLORS } from '../utils/constants';

const requesterSteps = [
  {
    title: 'Sign up and tell us what you need',
    body: 'Create a free account and post a request, from grocery runs to a ride to the doctor.',
  },
  {
    title: 'Get matched with a volunteer',
    body: "We connect you with a verified neighbor nearby who's ready to help.",
  },
  {
    title: 'Stay connected',
    body: 'Message your volunteer, schedule the visit, and build a lasting friendship.',
  },
];

const volunteerSteps = [
  {
    title: 'Sign up and set your availability',
    body: "Create a profile and tell us how and when you'd like to help out.",
  },
  {
    title: 'Browse requests nearby',
    body: 'See what neighbors in your area need, from errands to a friendly visit.',
  },
  {
    title: "Make someone's day easier",
    body: 'Accept a request, meet your neighbor, and make a real difference nearby.',
  },
];

const trustItems = [
  {
    icon: <GroupsOutlinedIcon sx={{ fontSize: 32, color: COLORS.forest }} />,
    title: 'Trusted community',
    body: "Every volunteer is verified and reviewed by the neighbors they've helped.",
  },
  {
    icon: <BoltOutlinedIcon sx={{ fontSize: 32, color: COLORS.forest }} />,
    title: 'Easy to use',
    body: 'Post a request or offer to help in a few clicks.',
  },
  {
    icon: <ShieldOutlinedIcon sx={{ fontSize: 32, color: COLORS.forest }} />,
    title: 'Safe and secure',
    body: 'Background checks, in-app messaging, and staff support keeps every visit safe.',
  },
];

function StepList({ steps }) {
  return (
    <Stack>
      {steps.map((step, i) => (
        <Stack
          key={step.title}
          direction="row"
          spacing={2}
          sx={{
            py: 2,
            borderTop: i === 0 ? 'none' : `1px solid ${COLORS.border}`,
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              width: 30,
              height: 30,
              borderRadius: '50%',
              bgcolor: COLORS.sage,
              color: COLORS.forest,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {i + 1}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
              {step.title}
            </Typography>
            <Typography sx={{ fontSize: 15, color: COLORS.grayText }}>
              {step.body}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

function HomePage() {
  return (
    <>
      <Container sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={8} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              sx={{
                color: COLORS.forest,
                fontWeight: 600,
                fontSize: 14,
                textTransform: 'uppercase',
                mb: 2,
              }}
            >
              Neighbors helping neighbors
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: 34, md: 46 },
                lineHeight: 1.15,
                color: COLORS.forest,
              }}
            >
              Stay independent.
              <br />
              Stay connected.
            </Typography>
            <Typography
              sx={{
                mt: 2,
                fontSize: 18,
                lineHeight: 1.65,
                color: COLORS.grayText,
              }}
            >
              Neighborhood Helper connects seniors with verified local
              volunteers for everyday support. Everything from errands, tech
              help, and companionship, we make it so no one has to manage alone.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ mt: 4 }}
            >
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                sx={{
                  bgcolor: COLORS.ink,
                  borderRadius: 999,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { bgcolor: COLORS.forestDark },
                }}
              >
                Sign up
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  color: COLORS.ink,
                  borderColor: COLORS.border,
                  '&:hover': {
                    borderColor: COLORS.ink,
                    bgcolor: 'transparent',
                  },
                }}
              >
                Log in
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src={hero}
                alt=""
                sx={{
                  width: '100%',
                  maxWidth: 480,
                  height: 'auto',
                  display: 'block',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Box
        sx={{
          borderTop: `1px solid ${COLORS.border}`,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <Container sx={{ py: { xs: 5, md: 7 } }}>
          <Grid container spacing={4}>
            {trustItems.map((item) => (
              <Grid
                size={{ xs: 12, md: 4 }}
                key={item.title}
                sx={{ textAlign: 'center' }}
              >
                <Box sx={{ mb: 1 }}>{item.icon}</Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: COLORS.forest,
                    mb: 0.5,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 15,
                    color: COLORS.grayText,
                    maxWidth: 250,
                    marginX: 'auto',
                  }}
                >
                  {item.body}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 5, md: 7 } }} id="how-it-works">
        <Box sx={{ textAlign: 'center', maxWidth: 560, mx: 'auto', mb: 7 }}>
          <Typography
            sx={{
              color: COLORS.forest,
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            How it works
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 32,
              color: COLORS.forest,
            }}
          >
            Two journeys, one connection
          </Typography>
          <Typography sx={{ mt: 1.5, color: COLORS.grayText, fontSize: 16 }}>
            Whether you need a hand or want to lend one, getting started takes
            just a few minutes.
          </Typography>
        </Box>

        <Grid container spacing={5} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 20,
                color: COLORS.forest,
                mb: 2,
              }}
            >
              If you need help
            </Typography>
            <StepList steps={requesterSteps} />
          </Grid>

          <Grid
            size={{ xs: 12, md: 2 }}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'row', md: 'column' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: { xs: 2, md: 5 },
            }}
          >
            <Divider
              orientation={{ xs: 'horizontal', md: 'vertical' }}
              sx={{
                flex: 1,
                borderStyle: 'dashed',
                borderColor: COLORS.sageLine,
                minHeight: { md: 60 },
              }}
            />
            <Box
              sx={{
                flexShrink: 0,
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: COLORS.forest,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              Matched
            </Box>
            <Divider
              orientation={{ xs: 'horizontal', md: 'vertical' }}
              sx={{
                flex: 1,
                borderStyle: 'dashed',
                borderColor: COLORS.sageLine,
                minHeight: { md: 60 },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 20,
                color: COLORS.forest,
                mb: 2,
              }}
            >
              If you want to help
            </Typography>
            <StepList steps={volunteerSteps} />
          </Grid>
        </Grid>
      </Container>

      <Container sx={{ pb: { xs: 5, md: 7 } }}>
        <Box
          sx={{
            bgcolor: COLORS.forest,
            color: '#fff',
            borderRadius: '20px',
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 5.5 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 26,
              maxWidth: 420,
            }}
          >
            Ready to join your neighborhood?
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              sx={{
                bgcolor: '#fff',
                color: COLORS.forestDark,
                borderRadius: 999,
                px: 3,
                py: 1.25,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#eef3ef' },
              }}
            >
              Sign up
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              sx={{
                borderRadius: 999,
                px: 3,
                py: 1.25,
                fontWeight: 600,
                textTransform: 'none',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                '&:hover': { borderColor: '#fff', bgcolor: 'transparent' },
              }}
            >
              Log in
            </Button>
          </Stack>
        </Box>
      </Container>
    </>
  );
}

export default HomePage;
