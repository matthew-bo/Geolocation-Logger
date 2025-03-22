import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Tooltip,
  ClickAwayListener,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import locationService from '../services/locationService';
import { useAuth } from '../context/AuthContext';

export default function LocationEdit({ placeInfo, onLocationUpdated }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [customName, setCustomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [originalAddress, setOriginalAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  useEffect(() => {
    loadLocationName();
  }, [placeInfo]);

  const loadLocationName = async () => {
    if (!placeInfo || !user) {
      setLoadingInitial(false);
      return;
    }
    
    try {
      setLoadingInitial(true);
      const address = placeInfo.address;
      setOriginalAddress(address || '');
      
      const displayName = await locationService.getLocationDisplayName(user.uid, placeInfo);
      setDisplayName(displayName);
      setCustomName(displayName);
    } catch (err) {
      console.error('Error loading location name:', err);
      setError('Failed to load location name. Please try again.');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleSave = async () => {
    if (!customName.trim()) {
      setError('Please enter a location name');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await locationService.setLocationAlias(user.uid, originalAddress, customName.trim());
      setDisplayName(customName);
      setIsEditing(false);
      setShowSuccess(true);
      if (onLocationUpdated) {
        onLocationUpdated();
      }
    } catch (err) {
      console.error('Error saving location name:', err);
      setError('Failed to save location name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setError(null);
    try {
      await locationService.removeLocationAlias(user.uid, originalAddress);
      setDisplayName(originalAddress);
      setCustomName(originalAddress);
      setIsEditing(false);
      setShowSuccess(true);
      if (onLocationUpdated) {
        onLocationUpdated();
      }
    } catch (err) {
      console.error('Error restoring location name:', err);
      setError('Failed to restore original name. Please try again.');
    } finally {
      setLoading(false);
    }
    setShowRestoreConfirm(false);
  };

  if (loadingInitial) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} sx={{ color: 'var(--beer-amber)' }} />
        <Typography variant="body2" color="text.secondary">
          Loading location...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isEditing ? (
          <ClickAwayListener onClickAway={() => !loading && setIsEditing(false)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <TextField
                size="small"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                disabled={loading}
                error={!!error}
                helperText={error}
                autoFocus
                fullWidth
                sx={{ 
                  '& .MuiInputBase-root': {
                    color: 'var(--text-primary)',
                    bgcolor: 'rgba(255,255,255,0.05)',
                  }
                }}
              />
              <Tooltip title="Save">
                <IconButton 
                  onClick={handleSave}
                  disabled={loading || !customName.trim()}
                  size="small"
                >
                  {loading ? (
                    <CircularProgress size={20} sx={{ color: 'var(--beer-amber)' }} />
                  ) : (
                    <SaveIcon sx={{ color: 'var(--beer-amber)' }} />
                  )}
                </IconButton>
              </Tooltip>
              {displayName !== originalAddress && (
                <Tooltip title="Restore original">
                  <IconButton 
                    onClick={() => setShowRestoreConfirm(true)}
                    disabled={loading}
                    size="small"
                  >
                    <RestoreIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </ClickAwayListener>
        ) : (
          <>
            <Typography 
              variant="body2" 
              sx={{ 
                color: displayName === originalAddress ? 'text.secondary' : 'text.primary',
                fontStyle: displayName === originalAddress ? 'italic' : 'normal'
              }}
            >
              {displayName || 'Unknown Location'}
            </Typography>
            <Tooltip title="Edit location name">
              <IconButton onClick={() => setIsEditing(true)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

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
          Location name updated successfully
        </Alert>
      </Snackbar>

      <Dialog
        open={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        PaperProps={{
          sx: {
            bgcolor: 'var(--background)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }
        }}
      >
        <DialogTitle>Restore Original Name?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'var(--text-secondary)' }}>
            This will remove your custom name and restore the original address. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowRestoreConfirm(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRestore}
            disabled={loading}
            sx={{ color: 'var(--beer-amber)' }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Restoring...
              </>
            ) : (
              'Restore'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 