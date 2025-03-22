import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from '../components/Layout';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import '../styles/transitions.css';
import { 
  LinearProgress, 
  Box, 
  Typography, 
  Button, 
  Container,
  Alert,
} from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';

// Create a client
const queryClient = new QueryClient();

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

function GlobalLoadingIndicator() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  if (!loading) return null;

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 9999 
      }}
    >
      <LinearProgress 
        sx={{ 
          height: 3,
          background: 'var(--dark-wood)',
          '& .MuiLinearProgress-bar': {
            background: 'var(--beer-amber)',
          }
        }} 
      />
    </Box>
  );
}

function FallbackComponent({ error, resetErrorBoundary }) {
  return (
    <Container 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        py: 4,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Oops! Something went wrong
      </Typography>
      
      <Alert 
        severity="error" 
        sx={{ 
          mb: 4,
          maxWidth: 600,
          width: '100%',
        }}
      >
        {error.message || 'An unexpected error occurred'}
      </Alert>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={resetErrorBoundary}
          sx={{
            background: 'var(--beer-amber)',
            '&:hover': {
              background: 'var(--copper)',
            }
          }}
        >
          Try Again
        </Button>
        <Button 
          variant="outlined"
          onClick={() => window.location.href = '/'}
          sx={{
            borderColor: 'var(--beer-amber)',
            color: 'var(--beer-amber)',
            '&:hover': {
              borderColor: 'var(--copper)',
              color: 'var(--copper)',
            }
          }}
        >
          Go Home
        </Button>
      </Box>
    </Container>
  );
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <AuthProvider>
          <NotificationProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalLoadingIndicator />
                <Layout>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={router.route}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      style={{ width: '100%' }}
                    >
                      <Component {...pageProps} />
                    </motion.div>
                  </AnimatePresence>
                </Layout>
                <ToastContainer
                  position="bottom-center"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                  style={{
                    '--toastify-color-progress-success': 'var(--beer-amber)',
                    '--toastify-color-progress-error': 'var(--error)',
                  }}
                />
              </ThemeProvider>
            </LocalizationProvider>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default MyApp; 