import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  CircularProgress,
  Alert,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
} from '@mui/material';

import { useUsers } from '../../hooks/admin/useUsers';
import { red, grey } from '@mui/material/colors';
import Pagination from '../common/Pagination';

function UserTable() {
  const { data, isLoading, error } = useUsers();
  const users = data?.users ?? [];

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  if (isLoading) {
    return <CircularProgress color="success" />;
  }

  if (error) {
    return <Alert severity="error">Failed to load users.</Alert>;
  }

  const filteredUsers = users
    .filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())
    )
    .filter((user) => (role === 'ALL' ? true : user.role === role));

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const totalPages = Math.ceil(sortedUsers.length / rowsPerPage);

  const currentUsers = sortedUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <>
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        spacing={3}
        sx={{
          mb: 5,
        }}
      >
        <TextField
          sx={{
            minWidth: 160,
            boxShadow: 3,
            borderRadius: 3,
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}

          label="Search User"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <FormControl
          sx={{
            minWidth: 160,
            boxShadow: 3,
            borderRadius: 3,
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        >
          <InputLabel>Role</InputLabel>

          <Select
            value={role}
            label="Role"
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="ALL">All</MenuItem>

            <MenuItem value="ADMIN">Admin</MenuItem>

            <MenuItem value="VOLUNTEER">Volunteer</MenuItem>

            <MenuItem value="REQUESTER">Requester</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          sx={{
            minWidth: 160,
            boxShadow: 3,
            borderRadius: 3,
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        >
          <InputLabel>Sort</InputLabel>

          <Select
            value={sortOrder}
            label="Sort"
            onChange={(e) => {
              setSortOrder(e.target.value);
            }}
          >
            <MenuItem value="newest">Newest</MenuItem>

            <MenuItem value="oldest">Oldest</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          borderRadius: 3,
          boxShadow: 3,
          overflowX: 'auto',
        }}
      >
        <Table
          sx={{
            minWidth: 800,
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: 'success.main',
              }}
            >
              {[
                'USER',
                'EMAIL',
                'ROLE',
                'PHONE',
                'GENDER',
                'DATE OF BIRTH',
                'ACTIONS',
              ].map((title) => (
                <TableCell
                  key={title}
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  {title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody
            sx={{
              bgcolor: grey[100],
            }}
          >
            {currentUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              currentUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      spacing={3}
                    >
                      <Avatar
                        src={user.profileImage}
                        alt={user.name}
                        sx={{
                          bgcolor: red[500],
                        }}
                      >
                        {user.name?.charAt(0)}
                      </Avatar>

                      {user.name}
                    </Stack>
                  </TableCell>

                  <TableCell>{user.email}</TableCell>

                  <TableCell>{user.role}</TableCell>

                  <TableCell>{user.phone || 'N/A'}</TableCell>

                  <TableCell>{user.gender || 'N/A'}</TableCell>

                  <TableCell>
                    {new Date(user.dob).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }) || 'N/A'}
                  </TableCell>

                  <TableCell>
                    {user.role === 'VOLUNTEER' ? (
                      <Button
                        component={RouterLink}
                        to={`/admin/users/${user.id}`}
                        size="small"
                        variant="outlined"
                      >
                        Edit prefs
                      </Button>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </>
  );
}

export default UserTable;
