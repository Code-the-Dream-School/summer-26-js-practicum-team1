import { Box, CardContent, Typography, Card } from '@mui/material';
import { grey } from '@mui/material/colors';

function DashboardCard({ title, value }) {
  return (
    <Box sx={{ minWidth: 275 }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: grey[100],
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              color: 'text.secondary',
              fontSize: 15,
              fontWeight: 700,
              mb: 3,
            }}
          >
            {title}
          </Typography>
          <Typography variant="h5">{value}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default DashboardCard;
