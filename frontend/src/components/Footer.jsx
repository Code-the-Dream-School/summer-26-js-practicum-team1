import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Stack, Typography, Link } from '@mui/material';
import logo from '../assets/logo.png';
import { COLORS } from '../utils/constants';

const productLinks = [
  { label: 'About', href: '#about' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Contact us', href: '#contact' },
];

const accountLinks = [
  { label: 'Sign up', to: '/signup' },
  { label: 'Log in', to: '/login' },
];

function FooterColumn({ title, children }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          textTransform: 'uppercase',
          color: COLORS.grayText,
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      <Stack spacing={0.25}>{children}</Stack>
    </Box>
  );
}

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ borderTop: `1px solid ${COLORS.border}`, mt: 'auto' }}
    >
      <Container sx={{ pt: { xs: 5, md: 6 }, pb: 4 }}>
        <Grid container spacing={4} sx={{ pb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <Box
                component="img"
                src={logo}
                viewBox="0 0 24 24"
                sx={{ width: 24, height: 24, flexShrink: 0 }}
              ></Box>
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                Neighborhood Helper
              </Typography>
            </Stack>
            <Typography
              sx={{
                mt: 2,
                fontSize: 14,
                color: COLORS.grayText,
                maxWidth: 280,
              }}
            >
              Connecting seniors with trusted local volunteers, one neighborhood
              at a time.
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <FooterColumn title="Product">
              {productLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  underline="none"
                  sx={{
                    fontSize: 15,
                    color: 'inherit',
                    py: 1,
                    '&:hover': { color: COLORS.forest },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </FooterColumn>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <FooterColumn title="Account">
              {accountLinks.map((link) => (
                <Link
                  key={link.label}
                  component={RouterLink}
                  to={link.to}
                  underline="none"
                  sx={{
                    fontSize: 15,
                    color: 'inherit',
                    py: 1,
                    '&:hover': { color: COLORS.forest },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </FooterColumn>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: `1px solid ${COLORS.border}`, pt: 3 }}>
          <Typography sx={{ fontSize: 13, color: COLORS.grayText }}>
            © {new Date().getFullYear()} Neighborhood Helper. All rights
            reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
