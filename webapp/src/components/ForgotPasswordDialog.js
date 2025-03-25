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

const RESET_COOLDOWN = 60; // seconds
const SUCCESS_MESSAGE_DURATION = 5000; // 5 seconds

export default function ForgotPasswordDialog({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
    getValues,
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
      setSuccess(false);
    }
  }, [open, resetForm]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleResend = () => {
    const email = getValues('email');
    if (email) {
      onSubmit({ email });
    }
  };

  const onSubmit = async (data) => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before trying again`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, data.email);
      setSuccess(true);
      setCooldown(RESET_COOLDOWN);
      setTimeout(() => {
        handleClose();
      }, SUCCESS_MESSAGE_DURATION);
    } catch (error) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          setCooldown(RESET_COOLDOWN * 2); // Double the cooldown for rate limiting
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
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
        <Typography variant="body2" sx={{ mb: 2, color: 'var(--text-secondary)' }}>
          Enter your email address and we'll send you instructions to reset your password.
          {success && " If you don't see the email, please check your spam folder."}
        </Typography>

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

        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={handleResend}
                disabled={cooldown > 0}
              >
                Resend
              </Button>
            }
          >
            Reset instructions sent! Please check your email.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} id="reset-form">
          <TextField
            fullWidth
            label="Email"
            autoComplete="email"
            disabled={loading || success}
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
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.9rem', sm: '1rem' },
              },
            }}
          />
        </form>

        {cooldown > 0 && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} sx={{ color: 'var(--beer-amber)' }} />
            <Typography 
              variant="body2" 
              color="var(--text-secondary)"
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Please wait {cooldown} seconds before trying again
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          sx={{ 
            color: 'var(--text-secondary)',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="reset-form"
          disabled={loading || success || cooldown > 0}
          sx={{
            bgcolor: 'var(--beer-amber)',
            color: 'var(--dark-wood)',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
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
      </DialogActions>
    </Dialog>
  );
} 