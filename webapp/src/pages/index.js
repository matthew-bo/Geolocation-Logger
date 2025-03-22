import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  CircularProgress,
  Snackbar,
  Alert,
  Backdrop,
} from '@mui/material';
import { LocalBar as BeerIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';
import Link from 'next/link';
import QuickLogButton from '../components/QuickLogButton';

// Beer bubble component
const Bubble = ({ delay, size, left }) => (
  <div
    className="bubble"
    style={{
      width: size,
      height: size,
      left: `${left}%`,
      bottom: '-100px',
      animation: `float 3s infinite ease-in-out ${delay}s`,
      opacity: Math.random() * 0.5 + 0.1
    }}
  />
);

export default function Home() {
  const router = useRouter();
  const { handleProtectedAction, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Generate random bubbles
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 30 + 10,
    left: Math.random() * 100,
    delay: Math.random() * 2
  }));

  const handleLogDrink = () => {
    setLoading(true);
    setError(null);
    handleProtectedAction('logDrink', () => {
      router.push('/log-drink');
    }).catch(error => {
      setError(error.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <>
      <Head>
        <title>Beer Peer | Track Your Beers</title>
        <meta name="description" content="Track and share your beer experiences with friends" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container 
        maxWidth={false}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(to bottom, var(--dark-wood), #121212)`,
          position: 'relative',
          overflow: 'hidden',
          pt: 8,
        }}
      >
        {/* Animated bubbles */}
        {bubbles.map(bubble => (
          <Bubble key={bubble.id} {...bubble} />
        ))}

        <Box 
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            maxWidth: '600px',
            width: '100%',
            px: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography 
            variant="h1" 
            component="h1" 
            className="logo-text" 
            sx={{ 
              mb: 2, 
              fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
              fontWeight: 700,
            }}
          >
            Beer Peer
          </Typography>

          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              mb: 6, 
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: 'var(--text-primary)',
              fontWeight: 300,
            }}
          >
            Track your beer adventures
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 4, width: '100%' }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ position: 'relative', display: 'inline-block', width: { xs: '220px', sm: '300px' } }}>
            <Button
              onClick={handleLogDrink}
              disabled={loading}
              sx={{
                width: '100%',
                height: { xs: '220px', sm: '300px' },
                borderRadius: '50%',
                fontSize: { xs: '1.5rem', sm: '2rem' },
                fontWeight: 500,
                background: 'linear-gradient(135deg, var(--beer-amber) 0%, var(--copper) 100%)',
                color: 'var(--dark-wood)',
                '&:hover': {
                  background: 'linear-gradient(135deg, var(--copper-light) 0%, var(--copper) 100%)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                },
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 2,
                '&.Mui-disabled': {
                  background: 'linear-gradient(135deg, var(--beer-amber) 0%, var(--copper) 100%)',
                  opacity: 0.7,
                },
              }}
            >
              {loading ? (
                <CircularProgress 
                  size={60}
                  sx={{ 
                    color: 'var(--dark-wood)',
                    opacity: 0.8
                  }} 
                />
              ) : (
                <>
                  <BeerIcon sx={{ 
                    fontSize: { xs: '4rem', sm: '5rem' },
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                    transition: 'all 0.3s ease'
                  }} />
                  Log a Beer
                </>
              )}
            </Button>
            
            <QuickLogButton 
              userId={user?.uid} 
              onSuccess={(message) => {
                setSuccessMessage(message);
                setShowSuccess(true);
              }}
              onError={(message) => {
                setError(message);
              }}
            />
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Button
              component={Link}
              href="/map"
              variant="text"
              sx={{
                color: 'var(--text-primary)',
                '&:hover': {
                  color: 'var(--beer-amber)',
                },
              }}
            >
              View Map
            </Button>
            <Button
              component={Link}
              href="/friends"
              variant="text"
              sx={{
                color: 'var(--text-primary)',
                '&:hover': {
                  color: 'var(--beer-amber)',
                },
              }}
            >
              Friends
            </Button>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            position: 'absolute', 
            bottom: '20px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            width: '100%',
          }}
        >
          Made with 🍺 for beer lovers
        </Typography>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowSuccess(false)} 
            severity="success"
            sx={{ width: '100%' }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Container>
    </>
  );
}