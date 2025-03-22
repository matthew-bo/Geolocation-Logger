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
      setError('Failed to load location name');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleSave = async () => {
    if (!originalAddress || !user) return;
    
    const trimmedName = customName.trim();
    if (trimmedName.length === 0 || trimmedName.length > 40) {
      setError('Location name must be between 1 and 40 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (trimmedName === originalAddress) {
        await locationService.removeLocationAlias(user.uid, originalAddress);
      } else {
        await locationService.setLocationAlias(user.uid, originalAddress, trimmedName);
      }

      setDisplayName(trimmedName);
      setIsEditing(false);
      if (onLocationUpdated) {
        onLocationUpdated();
      }
    } catch (err) {
      console.error('Error saving location alias:', err);
      setError('Failed to save location name');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!originalAddress || !user) return;

    setLoading(true);
    setError(null);

    try {
      await locationService.removeLocationAlias(user.uid, originalAddress);
      setDisplayName(originalAddress);
      setCustomName(originalAddress);
      setIsEditing(false);
      if (onLocationUpdated) {
        onLocationUpdated();
      }
    } catch (err) {
      console.error('Error restoring location name:', err);
      setError('Failed to restore original location name');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleLocationUpdated = () => {
    // Refresh all markers to update their display names
    if (onLocationUpdated) {
      onLocationUpdated();
    }
  };

  if (!placeInfo) return null;

  if (loadingInitial) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} sx={{ color: 'var(--beer-amber)' }} />
        <Typography variant="body2" color="var(--text-secondary)">
          Loading location...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        flexWrap: 'wrap',
        width: '100%'
      }}>
        {isEditing ? (
          <ClickAwayListener onClickAway={() => !loading && setIsEditing(false)}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              width: '100%',
              flexWrap: { xs: 'wrap', sm: 'nowrap' }
            }}>
              <TextField
                size="small"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                inputProps={{ 
                  maxLength: 40,
                  style: { fontSize: '0.875rem' }
                }}
                placeholder="Enter location name"
                disabled={loading}
                autoFocus
                sx={{
                  flexGrow: 1,
                  minWidth: { xs: '180px', sm: 'auto' },
                  '& .MuiInputBase-input': {
                    color: 'var(--text-primary)',
                    height: '1.5rem',
                    padding: '4px 8px',
                  },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'var(--glass-background)',
                    '& fieldset': {
                      borderColor: 'var(--border-color)',
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--beer-amber)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--beer-amber)',
                      borderWidth: '1px',
                    },
                  },
                }}
              />
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                ml: { xs: 0, sm: 1 }
              }}>
                <Tooltip title={loading ? 'Saving...' : 'Save'}>
                  <span>
                    <IconButton 
                      size="small" 
                      onClick={handleSave}
                      disabled={loading}
                      sx={{ 
                        color: 'var(--beer-amber)',
                        bgcolor: 'var(--glass-background)',
                        '&:hover': {
                          bgcolor: 'var(--glass-background-hover)',
                        },
                        '&.Mui-disabled': {
                          color: 'var(--text-disabled)',
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={16} sx={{ color: 'var(--beer-amber)' }} />
                      ) : (
                        <SaveIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
                {displayName !== originalAddress && (
                  <Tooltip title={loading ? 'Restoring...' : 'Restore original address'}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: loading ? 'var(--text-disabled)' : 'var(--text-secondary)',
                        cursor: loading ? 'default' : 'pointer',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 'var(--glass-background)',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: { xs: '120px', sm: '200px' },
                        '&:hover': {
                          bgcolor: loading ? 'var(--glass-background)' : 'var(--glass-background-hover)',
                          textDecoration: loading ? 'none' : 'underline',
                        },
                      }}
                      onClick={() => !loading && handleRestore()}
                    >
                      {originalAddress}
                    </Typography>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </ClickAwayListener>
        ) : (
          <>
            <Typography 
              variant="body2" 
              color="var(--text-secondary)"
              sx={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {displayName}
            </Typography>
            <Tooltip title="Edit location name">
              <IconButton
                size="small"
                onClick={() => setIsEditing(true)}
                sx={{ 
                  color: 'var(--text-secondary)',
                  bgcolor: 'var(--glass-background)',
                  '&:hover': {
                    bgcolor: 'var(--glass-background-hover)',
                    color: 'var(--beer-amber)',
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: 'var(--background)',
            color: 'var(--text-primary)',
          }
        }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          variant="filled"
          sx={{ 
            width: '100%',
            bgcolor: 'var(--background)',
            color: 'var(--text-primary)',
            '& .MuiAlert-icon': {
              color: '#f44336'
            },
            '& .MuiAlert-action': {
              color: 'var(--text-secondary)',
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
} 