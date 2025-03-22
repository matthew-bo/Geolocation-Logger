import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Tooltip,
  MenuItem,
  Button,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  LocalBar as BeerIcon,
  Person as PersonIcon,
  Map as MapIcon,
  Group as FriendsIcon,
  Login as LoginIcon,
  EmojiEvents as LeaderboardIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Link from 'next/link';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(18, 18, 18, 0.9)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(75, 43, 17, 0.15)',
  boxShadow: 'none',
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    background: 'rgba(18, 18, 18, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    marginTop: '8px',
    minWidth: '200px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  '& .MuiMenuItem-root': {
    padding: '12px 24px',
    gap: '12px',
    '&:hover': {
      background: 'rgba(251, 192, 45, 0.1)',
    },
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#ff1744',
    color: 'white',
    fontSize: '0.75rem',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
  },
}));

const pages = [
  { name: 'Map', path: '/map', icon: <MapIcon />, notificationKey: 'map' },
  { name: 'Log Drink', path: '/log-drink', icon: <BeerIcon />, requiresAuth: true, notificationKey: 'logDrink' },
  { name: 'Friends', path: '/friends', icon: <FriendsIcon />, notificationKey: 'friends' },
  { name: 'Leaderboard', path: '/leaderboards', icon: <LeaderboardIcon />, notificationKey: 'leaderboards' },
];

export default function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const router = useRouter();
  const { user, logout, handleProtectedAction } = useAuth();
  const { notifications } = useNotifications();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handlePageClick = (page) => {
    handleCloseNavMenu();
    if (page.requiresAuth) {
      handleProtectedAction('navigate', () => router.push(page.path));
    } else {
      router.push(page.path);
    }
  };

  const renderBadge = (page) => {
    const count = notifications[page.notificationKey];
    if (!count) return page.icon;
    
    return (
      <StyledBadge badgeContent={count} max={99}>
        {page.icon}
      </StyledBadge>
    );
  };

  return (
    <StyledAppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <BeerIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'var(--beer-amber)' }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'var(--beer-amber)',
              textDecoration: 'none',
              fontFamily: 'var(--font-family)',
            }}
          >
            Beer Peer
          </Typography>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{ color: 'var(--beer-amber)' }}
            >
              <MenuIcon />
            </IconButton>
            <StyledMenu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.name}
                  onClick={() => handlePageClick(page)}
                  sx={{
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {renderBadge(page)}
                  <Typography sx={{ ml: 1 }}>{page.name}</Typography>
                </MenuItem>
              ))}
            </StyledMenu>
          </Box>

          {/* Mobile Logo */}
          <BeerIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'var(--beer-amber)' }} />
          <Typography
            variant="h5"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'var(--beer-amber)',
              textDecoration: 'none',
              fontFamily: 'var(--font-family)',
            }}
          >
            Beer Peer
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={() => handlePageClick(page)}
                startIcon={renderBadge(page)}
                sx={{
                  color: router.pathname === page.path ? 'var(--beer-amber)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    color: 'var(--beer-amber)',
                    background: 'rgba(251, 192, 45, 0.1)',
                  },
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* User Menu */}
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'var(--beer-amber)',
                        border: '2px solid var(--copper)',
                      }}
                    >
                      {user.email ? user.email[0].toUpperCase() : 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <StyledMenu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem 
                    component={Link} 
                    href="/profile" 
                    onClick={handleCloseUserMenu}
                    sx={{ color: 'var(--text-primary)' }}
                  >
                    <PersonIcon />
                    <Typography>Profile</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ color: 'var(--text-primary)' }}
                  >
                    <LoginIcon />
                    <Typography>Logout</Typography>
                  </MenuItem>
                </StyledMenu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  component={Link} 
                  href="/login" 
                  startIcon={<LoginIcon />}
                  sx={{ 
                    color: 'var(--beer-amber)',
                    border: '1px solid var(--beer-amber)',
                    '&:hover': {
                      background: 'rgba(251, 192, 45, 0.1)',
                      borderColor: 'var(--copper)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button 
                  component={Link} 
                  href="/register" 
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    background: 'linear-gradient(135deg, var(--beer-amber) 0%, var(--copper) 100%)',
                    color: '#121212',
                    '&:hover': {
                      background: 'linear-gradient(135deg, var(--copper-light) 0%, var(--copper) 100%)',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
} 