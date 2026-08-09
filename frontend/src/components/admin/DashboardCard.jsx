import { Box, CardContent, Typography, Card } from '@mui/material';

function DashboardCard({ title, value, bgColor = 'background.paper' }) {
  return (
    <Box sx={{ minWidth: 275 }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: bgColor,
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
          <Typography sx={{ color: 'text.secondary', fontSize: 15 }}>
            {title}
          </Typography>
          <Typography variant="h5">{value}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default DashboardCard;
