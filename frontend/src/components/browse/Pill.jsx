import { Box } from '@mui/material';

function Pill({ label, backgroundColor, color }) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.25,
        borderRadius: 5,
        backgroundColor,
        color,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Box>
  );
}

export default Pill;
