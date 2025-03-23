import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { auth } from '../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';

const RESET_COOLDOWN = 60; // seconds

export default function ResetPasswordDialog({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
    watch,
  } = useForm();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!open) {
      resetForm();
      setError('');
      setEmailSent(false);
    }
  }, [open, resetForm]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleRequestReset = async (data) => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another reset link`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Configure actionCodeSettings for password reset
      const actionCodeSettings = {
        url: `https://www.ihadabeer.com/login?mode=resetPassword`,
        handleCodeInApp: false, // Set to false to use Firebase's hosted page
      };

      // Send password reset email through Firebase
      await sendPasswordResetEmail(auth, data.email, actionCodeSettings);
      
      setCooldown(RESET_COOLDOWN);
      setEmailSent(true);
      toast.success('Password reset link sent! Please check your email.', {
        position: "top-center",
        autoClose: 5000,
      });
    } catch (error) {
      let errorMessage = 'Failed to send reset link. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          setCooldown(RESET_COOLDOWN * 2);
          break;
        default:
          console.error('Password reset error:', error);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : handleClose}
      PaperProps={{
        sx: {
          bgcolor: 'var(--background)',
          color: 'var(--text-primary)',
          minWidth: { xs: '90%', sm: '400px' },
          maxWidth: { xs: '95%', sm: '450px' },
          margin: { xs: 2, sm: 'auto' },
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Reset Password
        {!loading && (
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ color: 'var(--text-secondary)' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              error.includes('Too many attempts') && (
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => setError('')}
                >
                  Dismiss
                </Button>
              )
            }
          >
            {error}
          </Alert>
        )}

        {emailSent ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" sx={{ mb: 2, color: 'var(--text-primary)' }}>
              A password reset link has been sent to your email.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'var(--text-secondary)' }}>
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </Typography>
            {cooldown > 0 ? (
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                You can request another link in {cooldown} seconds
              </Typography>
            ) : (
              <Button
                onClick={() => {
                  const email = watch('email');
                  if (email) handleRequestReset({ email });
                }}
                disabled={loading}
                sx={{ color: 'var(--beer-amber)' }}
              >
                Resend Link
              </Button>
            )}
          </Box>
        ) : (
          <Box component="form" id="reset-form" onSubmit={handleSubmit(handleRequestReset)}>
            <Typography variant="body2" sx={{ mb: 2, color: 'var(--text-secondary)' }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
            
            <TextField
              fullWidth
              label="Email"
              autoComplete="email"
              disabled={loading}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={loading}
          sx={{ color: 'var(--text-secondary)' }}
        >
          {emailSent ? 'Close' : 'Cancel'}
        </Button>
        {!emailSent && (
          <Button
            type="submit"
            form="reset-form"
            disabled={loading || cooldown > 0}
            sx={{
              bgcolor: 'var(--beer-amber)',
              color: 'var(--dark-wood)',
              '&:hover': {
                bgcolor: 'var(--copper)',
              },
              '&.Mui-disabled': {
                bgcolor: 'var(--beer-amber)',
                opacity: 0.5,
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 