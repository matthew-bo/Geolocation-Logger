import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  CircularProgress,
  Typography,
  Box,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AddMemberDialog({ open, onClose, group, onMemberAdded }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setSearchResults([]);
      setSelectedUsers([]);
      setError(null);
    }
  }, [open]);

  const handleSearch = async () => {
    if (searchTerm.length < 2) return;
    
    setLoading(true);
    setError(null);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      // Normalize search term
      const searchTermNormalized = searchTerm.toLowerCase().trim().replace(/\s+/g, ' ');
      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => {
          // Don't show current members or current user
          if (group.members.includes(u.id) || u.id === user.uid) return false;
          
          // Normalize user fields
          const username = (u.username || '').toLowerCase().trim().replace(/\s+/g, ' ');
          const email = (u.email || '').toLowerCase().trim();
          const displayName = (u.displayName || '').toLowerCase().trim().replace(/\s+/g, ' ');
          
          // Check if any part matches
          const searchParts = searchTermNormalized.split(' ');
          return searchParts.every(part => 
            username.includes(part) || 
            email.includes(part) ||
            displayName.includes(part)
          );
        });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleToggleUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    setAddLoading(true);
    setError(null);

    try {
      // Update group members
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, {
        members: arrayUnion(...selectedUsers)
      });

      // Create notifications for added members
      const notifications = selectedUsers.map(userId => ({
        userId,
        type: 'group_add',
        message: `You've been added to the group "${group.name}"`,
        read: false,
        createdAt: serverTimestamp(),
      }));

      await Promise.all(notifications.map(notification => 
        addDoc(collection(db, 'notifications'), notification)
      ));

      onMemberAdded();
      onClose();
    } catch (error) {
      console.error('Error adding members:', error);
      setError('Failed to add members. Please try again.');
    } finally {
      setAddLoading(false);
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
      <DialogTitle>Add Members</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSearch}
                  disabled={searchTerm.length < 2 || loading}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ color: 'var(--beer-amber)' }} />
          </Box>
        ) : searchResults.length === 0 ? (
          <Typography color="var(--text-secondary)" sx={{ textAlign: 'center', py: 2 }}>
            {searchTerm.length >= 2 ? 'No users found' : 'Type to search users'}
          </Typography>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {searchResults.map((user) => (
              <ListItem
                key={user.id}
                dense
                button
                onClick={() => handleToggleUser(user.id)}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedUsers.includes(user.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  primary={user.username || user.email?.split('@')[0]}
                  secondary={user.email}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={addLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleAddMembers}
          disabled={addLoading || selectedUsers.length === 0}
          sx={{ 
            color: 'var(--beer-amber)',
            '&:hover': { bgcolor: 'rgba(251, 192, 45, 0.1)' },
          }}
        >
          {addLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Adding...
            </>
          ) : (
            'Add Selected'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 