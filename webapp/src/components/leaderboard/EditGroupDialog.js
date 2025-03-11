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
} from '@mui/material';
import { db } from '../../config/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const RESET_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'never', label: 'Never' },
];

export default function EditGroupDialog({ open, onClose, group, onGroupUpdated }) {
  const [name, setName] = useState(group?.name || '');
  const [resetFrequency, setResetFrequency] = useState(group?.resetFrequency || 'weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const groupRef = doc(db, 'groups', group.id);
      const updates = {
        name: name.trim(),
        resetFrequency,
      };

      // If reset frequency changed, create notification for all members
      if (resetFrequency !== group.resetFrequency) {
        const notifications = group.members.map(memberId => ({
          userId: memberId,
          type: 'group_update',
          message: `The reset frequency for "${name.trim()}" has been changed to ${resetFrequency}`,
          read: false,
          createdAt: serverTimestamp(),
        }));

        await Promise.all(notifications.map(notification => 
          addDoc(collection(db, 'notifications'), notification)
        ));
      }

      await updateDoc(groupRef, updates);
      onGroupUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
      setError('Failed to update group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <DialogTitle>Edit Group</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Group Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth>
          <InputLabel>Reset Frequency</InputLabel>
          <Select
            value={resetFrequency}
            label="Reset Frequency"
            onChange={(e) => setResetFrequency(e.target.value)}
          >
            {RESET_FREQUENCIES.map(({ value, label }) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          sx={{ 
            color: 'var(--beer-amber)',
            '&:hover': { bgcolor: 'rgba(251, 192, 45, 0.1)' },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 