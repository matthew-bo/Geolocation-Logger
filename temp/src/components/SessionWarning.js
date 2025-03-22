import { useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function SessionWarning() {
  const { showTimeoutWarning, updateActivity } = useAuth();

  const handleExtend = () => {
    updateActivity();
  };

  return (
    <Snackbar
      open={showTimeoutWarning}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity="warning"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" size="small" onClick={handleExtend}>
              Keep Session Active
            </Button>
          </Box>
        }
        sx={{ width: '100%' }}
      >
        Your session will expire soon due to inactivity
      </Alert>
    </Snackbar>
  );
} 