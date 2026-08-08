import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  Container,
  Avatar,
  Tooltip,
  MenuItem,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';

const PAGES = [
  { label: 'About', path: '/' },
  { label: 'Contact Us', path: '/' },
];

const ROLE_SETTINGS = {
  requester: [
    { label: 'Profile', path: '/' },
    { label: 'Account', path: '/' },
    { label: 'My Requests', path: '/' },
  ],
  volunteer: [
    { label: 'Profile', path: '/' },
    { label: 'Account', path: '/' },
    { label: 'My Offers', path: '/' },
  ],
  admin: [
    { label: 'Profile', path: '/' },
    { label: 'Account', path: '/' },
    { label: 'Admin Dashboard', path: '/' },
  ],
};

/** Renders a list of { label, path } as MenuItems, closing the parent menu on click. */
function NavMenuItems({ items, onItemClick }) {
  return items.map(({ label, path }) => (
    <MenuItem
      key={label}
      component={Link}
      to={path}
      onClick={onItemClick}
      sx={{
        '&:hover': {
          backgroundColor: 'secondary.main',
          color: 'secondary.contrastText',
        },
      }}
    >
      <Typography sx={{ textAlign: 'center' }}>{label}</Typography>
    </MenuItem>
  ));
}

/** Logo + name, shown/hidden via sx so desktop and mobile share one implementation. */
function Brand({ display, variant, sx }) {
  return (
    <>
      <Box
        component="img"
        src={logo}
        alt="Neighborhood Helper Logo"
        sx={{ display, mr: 1, width: 40, height: 40 }}
      />
      <Typography
        variant={variant}
        noWrap
        component={Link}
        to="/"
        sx={{
          mr: 2,
          display,
          fontFamily: 'monospace',
          fontWeight: 700,
          color: 'inherit',
          textDecoration: 'none',
          ...sx,
        }}
      >
        Neighborhood Helper
      </Typography>
    </>
  );
}

function Header() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { user, isCheckingSession, logout } = useAuth();
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  const settings = (user && ROLE_SETTINGS[user.role]) || [];

  if (isCheckingSession) {
    return (
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters />
        </Container>
      </AppBar>
    );
  }

  return (
    <AppBar
      position="static"
      sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none' }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Brand display={{ xs: 'none', md: 'flex' }} variant="h6" />

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open navigation menu"
              aria-controls="menu-appbar-nav"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar-nav"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <NavMenuItems items={PAGES} onItemClick={handleCloseNavMenu} />

              {!user && (
                <>
                  <MenuItem
                    component={Link}
                    to="/login"
                    onClick={handleCloseNavMenu}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'secondary.main',
                        color: 'secondary.contrastText',
                      },
                    }}
                  >
                    <Typography sx={{ textAlign: 'center' }}>Log In</Typography>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/signup"
                    onClick={handleCloseNavMenu}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'secondary.main',
                        color: 'secondary.contrastText',
                      },
                    }}
                  >
                    <Typography sx={{ textAlign: 'center' }}>
                      Sign Up
                    </Typography>
                  </MenuItem>
                </>
              )}

              {user && (
                <NavMenuItems
                  items={settings}
                  onItemClick={handleCloseNavMenu}
                />
              )}

              {user && (
                <MenuItem
                  onClick={() => {
                    handleCloseNavMenu();
                    handleLogout();
                  }}
                >
                  <Typography sx={{ textAlign: 'center' }}>Logout</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          <Brand
            display={{ xs: 'flex', md: 'none' }}
            variant="h5"
            sx={{ flexGrow: 1 }}
          />

          <Box
            sx={{
              ml: 'auto',
              gap: 1,
              alignItems: 'center',
              display: { xs: 'none', md: 'flex' },
            }}
          >
            {PAGES.map(({ label, path }) => (
              <Button
                key={label}
                component={Link}
                to={path}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  color: 'black',
                  display: 'block',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'secondary.contrastText',
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {user ? (
            <>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user.name} sx={{ bgcolor: 'primary.main' }}>
                    {user.name?.[0]?.toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar-user"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <NavMenuItems
                  items={settings}
                  onItemClick={handleCloseUserMenu}
                />
                <MenuItem
                  onClick={handleLogout}
                  sx={{ '&:hover': { backgroundColor: 'secondary.main' } }}
                >
                  <Typography sx={{ textAlign: 'center' }}>Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: 'black',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'secondary.contrastText',
                  },
                }}
              >
                Log In
              </Button>
              <Button
                component={Link}
                to="/signup"
                variant="outlined"
                color="secondary"
                sx={{
                  color: 'secondary.contrastText',
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    borderColor: 'primary.dark',
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
