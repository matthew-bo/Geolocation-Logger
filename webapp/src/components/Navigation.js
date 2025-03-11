import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar } from '@mui/material';
import { 
  LocalBar as BeerIcon,
  Group as FriendsIcon,
  Person as ProfileIcon,
  Login as LoginIcon
} from '@mui/icons-material';

const Navigation = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        background: 'var(--background-secondary)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--glass-border)',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 30px var(--glass-shadow)' : 'none'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
            <BeerIcon sx={{ color: 'var(--beer-amber)' }} />
            <Typography 
              variant="h6" 
              className="logo-text"
              sx={{ 
                fontWeight: 700,
                letterSpacing: '0.02em',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Beer Peer
            </Typography>
          </Box>
        </Link>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {user ? (
            <>
              <Link href="/log-drink" passHref>
                <IconButton 
                  className={router.pathname === '/log-drink' ? 'active' : ''}
                  sx={{
                    color: 'var(--text-primary)',
                    '&:hover': { color: 'var(--beer-amber)' },
                    '&.active': { color: 'var(--beer-amber)' }
                  }}
                >
                  <BeerIcon />
                </IconButton>
              </Link>
              <Link href="/friends" passHref>
                <IconButton
                  className={router.pathname === '/friends' ? 'active' : ''}
                  sx={{
                    color: 'var(--text-primary)',
                    '&:hover': { color: 'var(--beer-amber)' },
                    '&.active': { color: 'var(--beer-amber)' }
                  }}
                >
                  <FriendsIcon />
                </IconButton>
              </Link>
              <Link href="/profile" passHref>
                <IconButton
                  className={router.pathname === '/profile' ? 'active' : ''}
                  sx={{
                    color: 'var(--text-primary)',
                    '&:hover': { color: 'var(--beer-amber)' },
                    '&.active': { color: 'var(--beer-amber)' }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: 'var(--copper)',
                      border: '2px solid var(--beer-amber)'
                    }}
                  >
                    {user.email?.[0].toUpperCase()}
                  </Avatar>
                </IconButton>
              </Link>
            </>
          ) : (
            <Link href="/login" passHref>
              <IconButton
                sx={{
                  color: 'var(--text-primary)',
                  '&:hover': { color: 'var(--beer-amber)' }
                }}
              >
                <LoginIcon />
              </IconButton>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 