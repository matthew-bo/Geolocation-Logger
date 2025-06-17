import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import ResetPasswordDialog from '../components/ResetPasswordDialog';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const hasHandledUrlParam = useRef(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Check for resetPassword mode in URL and auto-open dialog
  useEffect(() => {
    console.log('useEffect triggered - router.isReady:', router.isReady, 'router.query:', router.query, 'hasHandledUrlParam:', hasHandledUrlParam.current);
    
    // Only run this effect once when router is ready and we haven't handled the URL param yet
    if (router.isReady && !hasHandledUrlParam.current && router.query.mode === 'resetPassword') {
      console.log('Auto-opening reset password dialog due to URL parameter');
      hasHandledUrlParam.current = true;
      setResetPasswordOpen(true);
      // Clean up the URL by removing the mode parameter
      const { mode, ...queryParams } = router.query;
      router.replace({
        pathname: router.pathname,
        query: queryParams
      }, undefined, { shallow: true });
    } else {
      console.log('Not opening reset password dialog - conditions not met');
    }
  }, [router.isReady, router.query.mode, router]);

  // Debug: Log when resetPasswordOpen state changes
  useEffect(() => {
    console.log('resetPasswordOpen state changed to:', resetPasswordOpen);
  }, [resetPasswordOpen]);

  const onSubmit = async (data) => {
    console.log('Login form submitted'); // Debug log
    setLoading(true);
    
    // Prevent reset password dialog from opening during login
    if (resetPasswordOpen) {
      setResetPasswordOpen(false);
    }
    
    const result = await login(data.email, data.password);
    setLoading(false);

    if (!result.success) {
      toast.error(result.message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.success(result.message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      router.push('/');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            bgcolor: 'var(--background)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Login
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              autoComplete="email"
              autoFocus
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'var(--border-color)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--beer-amber)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'var(--text-secondary)',
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'var(--border-color)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--beer-amber)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'var(--text-secondary)',
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <MuiLink
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  setResetPasswordOpen(true);
                }}
                sx={{
                  color: 'var(--beer-amber)',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </MuiLink>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                bgcolor: loading ? 'grey.500' : 'var(--beer-amber)',
                color: 'var(--dark-wood)',
                '&:hover': {
                  bgcolor: loading ? 'grey.600' : 'var(--copper)'
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <MuiLink 
                  component={Link} 
                  href="/register"
                  sx={{
                    color: 'var(--beer-amber)',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign up
                </MuiLink>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>

      <ResetPasswordDialog
        open={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
      />
    </Container>
  );
} 