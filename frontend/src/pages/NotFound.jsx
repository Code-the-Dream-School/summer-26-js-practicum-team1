import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Stack, Typography, Button } from '@mui/material';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import { COLORS } from '../utils/constants';

function NotFound() {
  return (
    <Container sx={{ py: { xs: 8, md: 12 } }}>
      <Stack
        spacing={3}
        sx={{
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: COLORS.sage,
            color: COLORS.forest,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SearchOffOutlinedIcon sx={{ fontSize: 34 }} />
        </Box>

        <Typography
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: 30, md: 38 },
            color: COLORS.forest,
          }}
        >
          We couldn't find that page
        </Typography>

        <Typography
          sx={{
            fontSize: 16,
            color: COLORS.grayText,
          }}
        >
          The page you're looking for may have been moved, renamed, or doesn't
          exist.
        </Typography>

        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          sx={{
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: COLORS.forestDark },
          }}
        >
          Back to home
        </Button>
      </Stack>
    </Container>
  );
}

export default NotFound;
