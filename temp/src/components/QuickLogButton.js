import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalBar as BeerIcon } from '@mui/icons-material';
import { drinkService } from '../services/drinkService';
import { toast } from 'react-toastify';

const StyledQuickLogButton = styled(Button)(({ theme }) => ({
  width: '100%',
  background: 'var(--glass-background)',
  border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(10px)',
  color: 'var(--beer-amber)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, var(--beer-amber) 0%, var(--copper) 100%)',
    color: 'var(--dark-wood)',
    transform: 'scale(1.02)',
    boxShadow: '0 8px 32px rgba(251, 192, 45, 0.3)',
  },
  '&:disabled': {
    background: 'var(--glass-background)',
    opacity: 0.5,
  }
}));

export default function QuickLogButton({ userId }) {
  const [loading, setLoading] = useState(false);

  const handleQuickLog = async () => {
    if (!userId) {
      toast.error('Please log in to use this feature', {
        position: "top-center",
        autoClose: 3000,
        theme: "dark"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await drinkService.quickLogLastDrink(userId);
      if (result.success) {
        toast.success(result.message, {
          position: "top-center",
          autoClose: 3000,
          theme: "dark"
        });
      } else {
        toast.error(result.message, {
          position: "top-center",
          autoClose: 5000,
          theme: "dark"
        });
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.', {
        position: "top-center",
        autoClose: 5000,
        theme: "dark"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledQuickLogButton
      onClick={handleQuickLog}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BeerIcon />}
    >
      {loading ? 'Logging...' : 'Repeat Last Beer'}
    </StyledQuickLogButton>
  );
} 