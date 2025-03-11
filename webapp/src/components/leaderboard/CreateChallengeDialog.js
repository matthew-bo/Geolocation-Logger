import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CHALLENGE_TYPES = [
  { 
    value: 'unique_beers', 
    label: 'Unique Beers',
    description: 'First to try X different beers'
  },
  { 
    value: 'total_beers', 
    label: 'Total Beers',
    description: 'First to log X total beers'
  },
  { 
    value: 'streak', 
    label: 'Longest Streak',
    description: 'Maintain the longest daily logging streak'
  },
];

export default function CreateChallengeDialog({ open, onClose, group, onChallengeCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [goal, setGoal] = useState('');
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter a challenge name');
      return;
    }

    if (!type) {
      setError('Please select a challenge type');
      return;
    }

    if (!endDate) {
      setError('Please select an end date');
      return;
    }

    if (type !== 'streak' && (!goal || goal < 1)) {
      setError('Please enter a valid goal');
      return;
    }

    if (endDate <= new Date()) {
      setError('End date must be in the future');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const challengeData = {
        name: name.trim(),
        type,
        goal: type === 'streak' ? null : parseInt(goal),
        groupId: group.id,
        createdAt: serverTimestamp(),
        endDate,
        participants: group.members.map(memberId => ({
          userId: memberId,
          progress: 0,
          lastUpdated: new Date(),
        })),
        status: 'active',
      };

      const docRef = await addDoc(collection(db, 'challenges'), challengeData);

      // Create notifications for all members
      const notifications = group.members.map(memberId => ({
        userId: memberId,
        type: 'challenge_created',
        message: `New challenge "${name.trim()}" has started in "${group.name}"`,
        read: false,
        createdAt: serverTimestamp(),
      }));

      await Promise.all(notifications.map(notification => 
        addDoc(collection(db, 'notifications'), notification)
      ));

      onChallengeCreated();
      onClose();
    } catch (error) {
      console.error('Error creating challenge:', error);
      setError('Failed to create challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setType('');
    setGoal('');
    setEndDate(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'var(--background)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        }
      }}
    >
      <DialogTitle>Create Challenge</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Challenge Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Challenge Type</InputLabel>
          <Select
            value={type}
            label="Challenge Type"
            onChange={(e) => {
              setType(e.target.value);
              if (e.target.value === 'streak') {
                setGoal('');
              }
            }}
          >
            {CHALLENGE_TYPES.map(({ value, label }) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {type && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="var(--text-secondary)" gutterBottom>
              {CHALLENGE_TYPES.find(t => t.value === type)?.description}
            </Typography>
          </Box>
        )}

        {type && type !== 'streak' && (
          <TextField
            type="number"
            label="Goal"
            fullWidth
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />
        )}

        <DateTimePicker
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          minDateTime={new Date()}
          sx={{
            width: '100%',
            '& .MuiPaper-root': {
              backgroundColor: '#f5f5f5 !important',
              color: '#000000 !important'
            },
            '& .MuiCalendarPicker-root, & .MuiPickersDay-root, & .MuiClockPicker-root': {
              backgroundColor: '#f5f5f5 !important',
              color: '#000000 !important'
            },
            '& .MuiTypography-root': {
              color: '#000000 !important'
            },
            '& .MuiPickersDay-root': {
              '&.Mui-selected': {
                backgroundColor: 'var(--beer-amber) !important',
                color: '#000000 !important',
                fontWeight: 'bold'
              }
            },
            '& .MuiButtonBase-root': {
              color: '#000000 !important'
            },
            '& .MuiClock-pin, & .MuiClockPointer-root': {
              backgroundColor: 'var(--beer-amber) !important'
            },
            '& .MuiClockNumber-root': {
              color: '#000000 !important',
              '&.Mui-selected': {
                backgroundColor: 'var(--beer-amber) !important',
                color: '#000000 !important'
              }
            },
            '& .MuiDialogActions-root button': {
              color: '#000000 !important'
            }
          }}
          slotProps={{
            textField: {
              variant: 'outlined',
              fullWidth: true
            },
            layout: {
              sx: {
                bgcolor: '#f5f5f5',
                '& .MuiTypography-root': {
                  color: '#000000'
                },
                '& .MuiPickersLayout-actionBar': {
                  backgroundColor: '#f5f5f5'
                }
              }
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={loading}
          sx={{ 
            color: 'var(--beer-amber)',
            '&:hover': { bgcolor: 'rgba(251, 192, 45, 0.1)' },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Creating...
            </>
          ) : (
            'Create Challenge'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 