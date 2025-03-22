import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Avatar,
  Fade,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
} from '@mui/material';
import {
  PersonAdd as AddIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  Delete as RemoveIcon,
  Group as FriendsIcon,
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { friendService } from '../services/friendService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useRouter } from 'next/router';

// Bubble component reused from index page
const Bubble = ({ delay, size, left }) => (
  <div
    className="bubble"
    style={{
      width: size,
      height: size,
      left: `${left}%`,
      bottom: '-100px',
      animation: `float 3s infinite ease-in-out ${delay}s`,
      opacity: Math.random() * 0.5 + 0.1
    }}
  />
);

export default function Friends() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    request: null,
    friend: null
  });
  const [refreshing, setRefreshing] = useState(false);

  // Generate random bubbles
  const bubbles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 20 + 10,
    left: Math.random() * 100,
    delay: Math.random() * 2
  }));

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const friendsList = await friendService.getFriends(user.uid);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Failed to load friends. Please try again.');
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const requests = await friendService.getPendingRequests(user.uid);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load friend requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.length < 2) return;
    setSearchLoading(true);
    setError(null);
    try {
      console.log("Searching for:", searchTerm, "with user ID:", user?.uid);
      
      // Direct query for all users
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      // Normalize search term
      const searchTermNormalized = searchTerm.toLowerCase().trim().replace(/\s+/g, ' ');
      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => {
          if (u.id === user?.uid) return false;
          
          const username = (u.username || '').toLowerCase().trim().replace(/\s+/g, ' ');
          const email = (u.email || '').toLowerCase().trim();
          const displayName = (u.displayName || '').toLowerCase().trim().replace(/\s+/g, ' ');
          const firstName = (u.firstName || '').toLowerCase().trim().replace(/\s+/g, ' ');
          const lastName = (u.lastName || '').toLowerCase().trim().replace(/\s+/g, ' ');
          
          const searchParts = searchTermNormalized.split(' ');
          return searchParts.every(part => 
            username.includes(part) || 
            email.includes(part) ||
            displayName.includes(part) ||
            firstName.includes(part) ||
            lastName.includes(part)
          );
        });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setSearchLoading(false);
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

  const handleSendRequest = async (receiverId) => {
    setActionLoading(prev => ({ ...prev, request: receiverId }));
    try {
      await friendService.sendFriendRequest(user.uid, receiverId);
      setSearchResults(prev => prev.filter(user => user.id !== receiverId));
      setSuccessMessage('Friend request sent successfully');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error sending friend request:', error);
      setError('Failed to send friend request. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, request: null }));
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionLoading(prev => ({ ...prev, request: requestId }));
    try {
      await friendService.acceptFriendRequest(requestId);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      await fetchFriends();
      setSuccessMessage('Friend request accepted');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError('Failed to accept friend request. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, request: null }));
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionLoading(prev => ({ ...prev, request: requestId }));
    try {
      await friendService.rejectFriendRequest(requestId);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      setSuccessMessage('Friend request rejected');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setError('Failed to reject friend request. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, request: null }));
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    
    setActionLoading(prev => ({ ...prev, friend: friendToRemove.id }));
    try {
      await friendService.removeFriend(user.uid, friendToRemove.id);
      setFriends(prev => prev.filter(friend => friend.id !== friendToRemove.id));
      setSuccessMessage('Friend removed successfully');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error removing friend:', error);
      setError('Failed to remove friend. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, friend: null }));
      setShowRemoveConfirm(false);
      setFriendToRemove(null);
    }
  };

  const handleViewProfile = (friendId) => {
    router.push(`/profile?userId=${friendId}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await Promise.all([
        fetchFriends(),
        fetchPendingRequests()
      ]);
      setSuccessMessage('Friends list refreshed');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error refreshing friends:', error);
      setError('Failed to refresh friends list. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--background)'
      }}>
        <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 10,
        px: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background bubbles */}
      {bubbles.map(bubble => (
        <Bubble key={bubble.id} {...bubble} />
      ))}

      <Box
        sx={{
          maxWidth: 800,
          mx: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <IconButton
            sx={{
              width: 80,
              height: 80,
              mb: 2,
              background: 'var(--glass-background)',
              '&:hover': { background: 'var(--glass-background)' },
            }}
          >
            <FriendsIcon sx={{ fontSize: 40, color: 'var(--beer-amber)' }} />
          </IconButton>
          <Typography variant="h4" className="logo-text" gutterBottom>
            Beer Buddies
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Card className="glass-card" sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid var(--border-color)'
          }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="fullWidth"
              sx={{
                flex: 1,
                '& .MuiTab-root': {
                  color: 'var(--text-secondary)',
                  '&.Mui-selected': {
                    color: 'var(--beer-amber)',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'var(--beer-amber)',
                },
              }}
            >
              <Tab label="My Friends" />
              <Tab label="Add Friends" />
              <Tab label={`Requests (${pendingRequests.length})`} />
            </Tabs>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                ml: 2,
                borderColor: 'var(--beer-amber)',
                color: 'var(--beer-amber)',
                '&:hover': { borderColor: 'var(--copper)' }
              }}
            >
              {refreshing ? (
                <CircularProgress size={20} />
              ) : (
                <RefreshIcon />
              )}
            </Button>
          </Box>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <List>
                {friends.map((friend) => (
                  <ListItem
                    key={friend.id}
                    button
                    onClick={() => handleViewProfile(friend.id)}
                    sx={{
                      borderBottom: '1px solid var(--border-color)',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Avatar
                      src={friend.photoURL}
                      sx={{ mr: 2, bgcolor: 'var(--beer-amber)' }}
                    >
                      {friend.username?.[0]?.toUpperCase() || friend.displayName?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <ListItemText
                      primary={friend.username || friend.displayName || 'Anonymous Beer Lover'}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFriendToRemove(friend);
                          setShowRemoveConfirm(true);
                        }}
                        disabled={actionLoading.friend === friend.id}
                        sx={{ color: 'var(--text-secondary)' }}
                      >
                        {actionLoading.friend === friend.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <RemoveIcon />
                        )}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {friends.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No friends yet"
                      secondary="Add some friends to see their beer journey!"
                      sx={{ textAlign: 'center', color: 'var(--text-secondary)' }}
                    />
                  </ListItem>
                )}
              </List>
            )}

            {tabValue === 1 && (
              <Box sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search users by username"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={searchLoading}
                  inputProps={{
                    maxLength: 50,
                    pattern: "[A-Za-z0-9_-]*",
                    title: "Only letters, numbers, underscores, and hyphens are allowed"
                  }}
                  InputProps={{
                    startAdornment: searchLoading ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : (
                      <SearchIcon sx={{ mr: 1, color: 'var(--text-secondary)' }} />
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--border-color)' },
                      '&:hover fieldset': { borderColor: 'var(--beer-amber)' },
                      '&.Mui-focused fieldset': { borderColor: 'var(--beer-amber)' },
                    }
                  }}
                />

                {/* Search Results */}
                <List>
                  {searchResults.map((result) => (
                    <ListItem
                      key={result.id}
                      sx={{
                        borderBottom: '1px solid var(--border-color)',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Avatar
                        src={result.photoURL}
                        sx={{ mr: 2, bgcolor: 'var(--beer-amber)' }}
                      >
                        {result.username?.[0]?.toUpperCase() || result.displayName?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <ListItemText
                        primary={result.username || result.displayName || 'Anonymous Beer Lover'}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleSendRequest(result.id)}
                          disabled={actionLoading.request === result.id}
                          sx={{ color: 'var(--beer-amber)' }}
                        >
                          {actionLoading.request === result.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <AddIcon />
                          )}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {searchTerm.length >= 2 && searchResults.length === 0 && !searchLoading && (
                    <ListItem>
                      <ListItemText
                        primary="No users found"
                        secondary="Try a different search term"
                        sx={{ textAlign: 'center', color: 'var(--text-secondary)' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}

            {tabValue === 2 && (
              <List>
                {pendingRequests.map((request) => (
                  <ListItem
                    key={request.id}
                    sx={{
                      borderBottom: '1px solid var(--border-color)',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Avatar
                      src={request.senderPhotoURL}
                      sx={{ mr: 2, bgcolor: 'var(--beer-amber)' }}
                    >
                      {request.senderUsername?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <ListItemText
                      primary={request.senderUsername || 'Anonymous Beer Lover'}
                      secondary={request.createdAt ? new Date(request.createdAt.seconds * 1000).toLocaleString() : ''}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={actionLoading.request === request.id}
                        sx={{ color: 'var(--beer-amber)', mr: 1 }}
                      >
                        {actionLoading.request === request.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <AcceptIcon />
                        )}
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={actionLoading.request === request.id}
                        sx={{ color: 'var(--text-secondary)' }}
                      >
                        {actionLoading.request === request.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <RejectIcon />
                        )}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {pendingRequests.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No pending requests"
                      secondary="Friend requests will appear here"
                      sx={{ textAlign: 'center', color: 'var(--text-secondary)' }}
                    />
                  </ListItem>
                )}
              </List>
            )}
          </Box>
        </Card>
      </Box>

      {/* Remove Friend Confirmation Dialog */}
      <Dialog
        open={showRemoveConfirm}
        onClose={() => !actionLoading.friend && setShowRemoveConfirm(false)}
        PaperProps={{
          sx: {
            bgcolor: 'var(--background)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }
        }}
      >
        <DialogTitle>Remove Friend?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'var(--text-secondary)' }}>
            Are you sure you want to remove {friendToRemove?.username || 'this friend'}? You'll need to send a new friend request to add them again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowRemoveConfirm(false)}
            disabled={actionLoading.friend}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRemoveFriend}
            disabled={actionLoading.friend}
            color="error"
          >
            {actionLoading.friend ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Removing...
              </>
            ) : (
              'Remove'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
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
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 