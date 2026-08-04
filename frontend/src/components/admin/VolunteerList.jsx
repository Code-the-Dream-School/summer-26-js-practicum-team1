import { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

import VolunteerCard from './VolunteerCard';
import Pagination from '../common/Pagination';

function VolunteerList({ volunteers = [] }) {
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('newest');

  const cardsPerPage = 4;

  const totalPages = Math.ceil(volunteers.length / cardsPerPage);

  const startIndex = (page - 1) * cardsPerPage;

  const sortedVolunteers = [...volunteers].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const currentVolunteers = sortedVolunteers.slice(
    startIndex,
    startIndex + cardsPerPage
  );

  return (
    <>
      {volunteers.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No pending volunteer approvals 🎉
          </Typography>
        </Box>
      ) : (
        <>
          <FormControl
            fullWidth

            sx={{
              mb: 3,
              boxShadow: 3,
              borderRadius: 3,

              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          >
            <InputLabel>Sort By</InputLabel>

            <Select
              value={sortOrder}
              label="Sort By"
              onChange={(event) => {
                setSortOrder(event.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="newest">Newest First</MenuItem>

              <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
          </FormControl>
          <Grid container spacing={3}>
            {currentVolunteers.map((volunteer) => (
              <Grid
                key={volunteer.userId}
                size={{
                  xs: 12,
                  md: 12,
                }}
              >
                <VolunteerCard
                  userId={volunteer.userId}
                  name={volunteer.user.name}
                  email={volunteer.user.email}
                  gender={volunteer.user.gender}
                  status={volunteer.verificationStatus}
                  dob={volunteer.user.dob}
                  phone={volunteer.user.phone}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </>
  );
}

export default VolunteerList;
