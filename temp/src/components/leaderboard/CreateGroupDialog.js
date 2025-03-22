import { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  CircularProgress,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { friendService } from '../../services/friendService';

const RESET_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'never', label: 'Never' },
];

export default function CreateGroupDialog({ open, onClose, onGroupCreated }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [resetFrequency, setResetFrequency] = useState('weekly');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFriends();
      // Reset form
      setName('');
      setResetFrequency('weekly');
      setSelectedFriends([]);
      setError(null);
    }
  }, [open]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const friendsList = await friendService.getFriends(user.uid);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Failed to load friends list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFriend = (friendId) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (selectedFriends.length === 0) {
      setError('Please select at least one friend');
      return;
    }

    setCreateLoading(true);
    setError(null);

    try {
      // Create group document
      const groupData = {
        name: name.trim(),
        creatorId: user.uid,
        resetFrequency,
        members: [user.uid, ...selectedFriends],
        createdAt: serverTimestamp(),
        lastReset: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'groups'), groupData);

      // Create initial notifications for all members
      const notifications = selectedFriends.map(friendId => ({
        userId: friendId,
        type: 'group_add',
        message: `You've been added to the group "${name.trim()}"`,
        read: false,
        createdAt: serverTimestamp(),
      }));

      // Batch add notifications
      await Promise.all(notifications.map(notification => 
        addDoc(collection(db, 'notifications'), notification)
      ));

      onGroupCreated();
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group. Please try again.');
    } finally {
      setCreateLoading(false);
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
      <DialogTitle>Create New Group</DialogTitle>
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

        <FormControl fullWidth sx={{ mb: 3 }}>
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

        <Typography variant="subtitle1" gutterBottom>
          Select Friends
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ color: 'var(--beer-amber)' }} />
          </Box>
        ) : friends.length === 0 ? (
          <Typography color="var(--text-secondary)" sx={{ textAlign: 'center', py: 2 }}>
            No friends found. Add some friends first!
          </Typography>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {friends.map((friend) => (
              <ListItem
                key={friend.id}
                dense
                button
                onClick={() => handleToggleFriend(friend.id)}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedFriends.includes(friend.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={friend.username || friend.displayName || 'Anonymous Beer Lover'}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreate}
          disabled={createLoading || loading || friends.length === 0}
          sx={{ 
            color: 'var(--beer-amber)',
            '&:hover': { bgcolor: 'rgba(251, 192, 45, 0.1)' },
          }}
        >
          {createLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Creating...
            </>
          ) : (
            'Create Group'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 