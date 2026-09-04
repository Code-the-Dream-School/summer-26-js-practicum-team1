import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Typography,
  Box,
  Chip,
} from '@mui/material';

import { useAdminUserProfileImage } from '../../hooks/admin/useAdminUserProfileImage';

import { grey } from '@mui/material/colors';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import { useUsers } from '../../hooks/admin/useUsers';
import Pagination from '../common/Pagination';

const filterFieldSx = {
  minWidth: { xs: '100%', sm: 160 },
  flex: { sm: 1 },
  boxShadow: 3,
  borderRadius: 1,

  '& .MuiOutlinedInput-root': {
    height: 40,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
  },
};

const viewButtonSx = {
  fontSize: '0.8125rem',
  fontWeight: 400,
  textTransform: 'none',
  minWidth: 64,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 1,
  },
};

const headerCellSx = {
  color: 'common.white',
  fontWeight: 600,
  fontSize: '0.75rem',
  py: 1.25,
  px: 2,
  borderBottom: 'none',
  whiteSpace: 'nowrap',
};

const bodyCellSx = {
  py: 1.25,
  px: 2,
  fontSize: '0.875rem',
  fontWeight: 400,
};

const stickyActionsCellSx = {
  position: 'sticky',
  right: 0,
  bgcolor: 'background.paper',
  zIndex: 1,
  boxShadow: '-4px 0 8px -4px rgba(0,0,0,0.08)',
};

const stickyActionsHeaderSx = {
  ...stickyActionsCellSx,
  top: 0,
  bgcolor: 'primary.main',
  zIndex: 3,
  boxShadow: 'none',
};

const hideOnXs = {
  display: { xs: 'none', sm: 'table-cell' },
};

function getRoleChipProps(role) {
  switch (role) {
    case 'ADMIN':
      return {
        label: 'Admin',
        variant: 'filled',
        sx: { backgroundColor: '#B33F32', color: '#FFF' },
      };
    case 'VOLUNTEER':
      return {
        label: 'Volunteer',
        variant: 'filled',
        sx: { backgroundColor: '#6b6b6b', color: '#FFF' },
      };
    case 'REQUESTER':
      return {
        label: 'Requester',
        variant: 'filled',
        sx: { backgroundColor: '#C1791E', color: '#FFF' },
      };
    default:
      return {
        label: 'N/A',
        variant: 'outlined',
        color: 'default',
      };
  }
}

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatGender(value) {
  if (!value) return 'N/A';
  const labels = {
    PREFER_NOT_TO_SAY: 'Prefer not to say',
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
  };
  return labels[value] ?? value;
}

const SORT_LABELS = {
  newest: 'Newest',
  oldest: 'Oldest',
};

function AdminUserAvatar({ user }) {
  const { data: profileImageUrl } = useAdminUserProfileImage(user.id);

  return (
    <Avatar
      src={profileImageUrl || undefined}
      alt={user.name}
      sx={{
        width: 34,
        height: 34,
        fontSize: '0.8125rem',
        bgcolor: 'primary.main',
      }}
    >
      {user.name?.charAt(0)?.toUpperCase()}
    </Avatar>
  );
}

function UserTable() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useUsers();
  const users = data?.users ?? [];

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);

  const rowsPerPage = 8;

  const handleClearFilters = () => {
    setSearch('');
    setRole('ALL');
    setSortOrder('newest');
    setPage(1);
  };

  const handleRowClick = (userId, event) => {
    if (event.target.closest('a, button')) return;
    navigate(`/admin/users/${userId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress color="success" />
      </Box>
    );
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

  const totalPages = Math.ceil(sortedUsers.length / rowsPerPage) || 1;

  const currentUsers = sortedUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const hasActiveFilters =
    search !== '' || role !== 'ALL' || sortOrder !== 'newest';

  return (
    <>
      <Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            alignItems: { sm: 'center' },
          }}
        >
          <TextField
            sx={filterFieldSx}
            size="small"
            label="Search user"
            placeholder="Name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <FormControl sx={filterFieldSx} size="small">
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

          <FormControl sx={filterFieldSx} size="small">
            <InputLabel>Sort</InputLabel>
            <Select
              value={sortOrder}
              label="Sort"
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
            </Select>
          </FormControl>

          <Chip
            label={`${filteredUsers.length} user${filteredUsers.length === 1 ? '' : 's'}`}
            color="#171717"
            variant="outlined"
            size="small"
            sx={{
              ml: { sm: 'auto' },
              height: 35,
              px: 0.5,
              fontSize: '0.75rem',
              fontWeight: 500,
              borderColor: 'primary.main',
              alignSelf: { xs: 'flex-start', sm: 'center' },
            }}
          />
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1.5, fontSize: '0.75rem' }}
        >
          Sorted by: {SORT_LABELS[sortOrder]}
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '100%',
          borderRadius: 1,
          border: 1,
          mt: 4,
          borderColor: 'divider',
          boxShadow: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          bgcolor: 'background.paper',
          '&::-webkit-scrollbar': {
            height: 8,
            width: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: grey[400],
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: grey[100],
          },
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow
              sx={{
                '& .MuiTableCell-head': headerCellSx,
              }}
            >
              <TableCell
                sx={{
                  ...headerCellSx,
                  bgcolor: 'primary.main',
                }}
              >
                User
              </TableCell>
              <TableCell sx={{ ...headerCellSx, bgcolor: 'primary.main' }}>
                Email
              </TableCell>
              <TableCell sx={{ ...headerCellSx, bgcolor: 'primary.main' }}>
                Role
              </TableCell>
              <TableCell
                sx={{ ...headerCellSx, bgcolor: 'primary.main', ...hideOnXs }}
              >
                Phone
              </TableCell>
              <TableCell
                sx={{ ...headerCellSx, bgcolor: 'primary.main', ...hideOnXs }}
              >
                Gender
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...headerCellSx, bgcolor: 'primary.main' }}
              >
                Date of birth
              </TableCell>
              <TableCell
                align="center"
                sx={{ ...headerCellSx, ...stickyActionsHeaderSx }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {currentUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Stack
                    spacing={1.5}
                    sx={{
                      alignItems: 'center',
                    }}
                  >
                    <SearchOffOutlinedIcon
                      sx={{ fontSize: 40, color: 'text.disabled' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                    {hasActiveFilters && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={handleClearFilters}
                        sx={{ textTransform: 'none' }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              currentUsers.map((user, index) => (
                <TableRow
                  key={user.id}
                  hover
                  onClick={(event) => handleRowClick(user.id, event)}
                  sx={{
                    bgcolor: 'background.paper',
                    cursor: 'pointer',
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:hover .sticky-actions-cell': {
                      bgcolor: 'action.hover',
                    },
                    ...(index < currentUsers.length - 1 && {
                      '& td': {
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      },
                    }),
                  }}
                >
                  <TableCell sx={{ minWidth: 180, ...bodyCellSx }}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{
                        alignItems: 'center',
                      }}
                    >
                      <AdminUserAvatar user={user} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                        noWrap
                      >
                        {user.name}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 220, ...bodyCellSx }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={400}
                      noWrap
                      title={user.email}
                    >
                      {user.email}
                    </Typography>
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <Chip
                      {...getRoleChipProps(user.role)}
                      size="small"
                      sx={{
                        height: 24,
                        width: 85,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        ...getRoleChipProps(user.role).sx,
                      }}
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      ...bodyCellSx,
                      ...hideOnXs,
                      whiteSpace: 'nowrap',
                      color: 'text.secondary',
                    }}
                  >
                    {user.phone || 'N/A'}
                  </TableCell>

                  <TableCell
                    sx={{
                      ...bodyCellSx,
                      ...hideOnXs,
                      whiteSpace: 'nowrap',
                      color: 'text.secondary',
                    }}
                  >
                    {formatGender(user.gender)}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      ...bodyCellSx,
                      whiteSpace: 'nowrap',
                      fontVariantNumeric: 'tabular-nums',
                      color: 'text.secondary',
                    }}
                  >
                    {formatDate(user.dob)}
                  </TableCell>

                  <TableCell
                    align="center"
                    className="sticky-actions-cell"
                    sx={{
                      ...bodyCellSx,
                      ...stickyActionsCellSx,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Button
                      component={RouterLink}
                      to={`/admin/users/${user.id}`}
                      size="small"
                      variant="contained"
                      color="primary"
                      sx={viewButtonSx}
                      onClick={(event) => event.stopPropagation()}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ mt: 3 }}>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Box>
      )}
    </>
  );
}

export default UserTable;
