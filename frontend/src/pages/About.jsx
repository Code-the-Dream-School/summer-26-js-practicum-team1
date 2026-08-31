import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Stack, Typography, Button, Grid } from '@mui/material';
import ElderlyOutlinedIcon from '@mui/icons-material/ElderlyOutlined';
import AccessibleOutlinedIcon from '@mui/icons-material/AccessibleOutlined';
import PregnantWomanOutlinedIcon from '@mui/icons-material/PregnantWomanOutlined';
import ChildFriendlyOutlinedIcon from '@mui/icons-material/ChildFriendlyOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import { COLORS } from '../utils/constants';

const whoWeServe = [
  {
    icon: <ElderlyOutlinedIcon sx={{ fontSize: 30, color: COLORS.forest }} />,
    title: 'Older adults',
    body: 'Neighbors who have given so much to their families and communities and now need a bit of support in return.',
  },
  {
    icon: (
      <AccessibleOutlinedIcon sx={{ fontSize: 30, color: COLORS.forest }} />
    ),
    title: 'People with disabilities',
    body: 'Assistance based on individual needs, so independence stays within reach.',
  },
  {
    icon: (
      <PregnantWomanOutlinedIcon sx={{ fontSize: 30, color: COLORS.forest }} />
    ),
    title: 'Pregnant women',
    body: 'Extra help during a physically demanding stage of life.',
  },
  {
    icon: (
      <ChildFriendlyOutlinedIcon sx={{ fontSize: 30, color: COLORS.forest }} />
    ),
    title: 'New mothers',
    body: 'Support with daily errands while recovering after childbirth.',
  },
];

const values = [
  {
    icon: (
      <FavoriteBorderOutlinedIcon sx={{ fontSize: 30, color: COLORS.forest }} />
    ),
    title: 'Kindness',
    body: 'Every person deserves to feel valued, respected, safe, and connected.',
  },
  {
    icon: (
      <VerifiedUserOutlinedIcon sx={{ fontSize: 30, color: COLORS.forest }} />
    ),
    title: 'Trust',
    body: 'Background-verified volunteers so every visit is safe and reliable.',
  },
  {
    icon: <HandshakeOutlinedIcon sx={{ fontSize: 30, color: COLORS.forest }} />,
    title: 'Independence',
    body: 'We aim to empower people to live as independently as possible.',
  },
  {
    icon: (
      <Diversity3OutlinedIcon sx={{ fontSize: 30, color: COLORS.forest }} />
    ),
    title: 'Inclusion',
    body: 'Stronger, more compassionate neighborhoods where people of all ages support one another.',
  },
];

function AboutPage() {
  return (
    <>
      <Container sx={{ py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 640 }}>
          <Typography
            sx={{
              color: COLORS.forest,
              fontWeight: 600,
              fontSize: 14,
              textTransform: 'uppercase',
              mb: 2,
            }}
          >
            Our story
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: 32, md: 44 },
              lineHeight: 1.15,
              color: COLORS.forest,
            }}
          >
            Independence shouldn't mean going about it alone
          </Typography>
          <Typography
            sx={{
              mt: 2,
              fontSize: 18,
              lineHeight: 1.65,
              color: COLORS.grayText,
            }}
          >
            Many people in our communities need extra support with everyday
            tasks. Older adults are one of the largest groups requiring
            assistance, but they aren't the only ones — people with
            disabilities, pregnant women, new mothers recovering after
            childbirth, and others facing temporary or long-term challenges may
            also need help but not always have family or friends available to
            support them.
          </Typography>
          <Typography
            sx={{
              mt: 2,
              fontSize: 18,
              lineHeight: 1.65,
              color: COLORS.grayText,
            }}
          >
            Neighborhood Helper is a community platform that connects people who
            need assistance with trusted volunteers and community members who
            are willing to help. Thus, empowering people to live as
            independently as possible while building stronger, more
            compassionate neighborhoods.
          </Typography>
        </Box>
      </Container>

      <Box sx={{ bgcolor: COLORS.bgSubtle }}>
        <Container sx={{ py: { xs: 5, md: 7 } }}>
          <Box sx={{ textAlign: 'center', px: 4, mb: 6 }}>
            <Typography
              sx={{
                color: COLORS.forest,
                fontWeight: 600,
                fontSize: 14,
                textTransform: 'uppercase',
                mb: 1,
              }}
            >
              Who we serve
            </Typography>
            <Typography
              sx={{ fontWeight: 700, fontSize: 32, color: COLORS.forest }}
            >
              Support for every stage of life
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {whoWeServe.map((item) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 3 }}
                key={item.title}
                sx={{ textAlign: 'center' }}
              >
                <Box sx={{ mb: 1 }}>{item.icon}</Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 17,
                    color: COLORS.forest,
                    mb: 1,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 15,
                    color: COLORS.grayText,
                    maxWidth: 230,
                    mx: 'auto',
                  }}
                >
                  {item.body}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 5, md: 7 } }}>
        <Box sx={{ textAlign: 'center', px: 4, mb: 6 }}>
          <Typography
            sx={{
              color: COLORS.forest,
              fontWeight: 600,
              fontSize: 14,
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            What we stand for
          </Typography>
          <Typography
            sx={{ fontWeight: 700, fontSize: 32, color: COLORS.forest }}
          >
            A community built on kindness, trust, and respect
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {values.map((item) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              key={item.title}
              sx={{ textAlign: 'center' }}
            >
              <Box sx={{ mb: 1 }}>{item.icon}</Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 17,
                  color: COLORS.forest,
                  mb: 1,
                }}
              >
                {item.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  color: COLORS.grayText,
                  maxWidth: 230,
                  mx: 'auto',
                }}
              >
                {item.body}
              </Typography>
            </Grid>
          ))}
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
          <Typography sx={{ fontWeight: 700, fontSize: 26, maxWidth: 420 }}>
            Want to be part of the story?
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
                py: 1,
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

export default AboutPage;
