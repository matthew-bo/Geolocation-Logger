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
} from '@mui/material';
import {
  PersonAdd as AddIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  Delete as RemoveIcon,
  Group as FriendsIcon,
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
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
  const [loading, setLoading] = useState(false);

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
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const requests = await friendService.getPendingRequests(user.uid);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.length < 2) return;
    setLoading(true);
    try {
      console.log("Searching for:", searchTerm, "with user ID:", user?.uid);
      
      // Direct query for all users
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      // Normalize search term: remove extra spaces and convert to lowercase
      const searchTermNormalized = searchTerm.toLowerCase().trim().replace(/\s+/g, ' ');
      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => {
          // Don't show current user in results
          if (u.id === user?.uid) return false;
          
          // Normalize all fields: remove extra spaces and convert to lowercase
          const username = (u.username || '').toLowerCase().trim().replace(/\s+/g, ' ');
          const email = (u.email || '').toLowerCase().trim();
          const displayName = (u.displayName || '').toLowerCase().trim().replace(/\s+/g, ' ');
          const firstName = (u.firstName || '').toLowerCase().trim().replace(/\s+/g, ' ');
          const lastName = (u.lastName || '').toLowerCase().trim().replace(/\s+/g, ' ');
          
          // Check if any part of the normalized search term matches any part of the normalized fields
          const searchParts = searchTermNormalized.split(' ');
          return searchParts.every(part => 
            username.includes(part) || 
            email.includes(part) ||
            displayName.includes(part) ||
            firstName.includes(part) ||
            lastName.includes(part)
          );
        });
      
      console.log("Found users:", results);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
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

  const handleSendRequest = async (receiverId) => {
    try {
      await friendService.sendFriendRequest(user.uid, receiverId);
      setSearchResults(prev => prev.filter(user => user.id !== receiverId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      fetchFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await friendService.removeFriend(user.uid, friendId);
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleViewProfile = (friendId) => {
    router.push(`/profile?userId=${friendId}`);
  };

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

        <Card className="glass-card" sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{
              borderBottom: '1px solid var(--glass-border)',
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
                          handleRemoveFriend(friend.id);
                        }}
                        sx={{ color: 'var(--text-secondary)' }}
                      >
                        <RemoveIcon />
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
                  inputProps={{
                    maxLength: 50,
                    pattern: "[A-Za-z0-9_-]*",
                    title: "Only letters, numbers, underscores, and hyphens are allowed"
                  }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'var(--text-secondary)' }} />,
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
                            handleRemoveFriend(friend.id);
                          }}
                          sx={{ color: 'var(--text-secondary)' }}
                        >
                          <RemoveIcon />
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
                          sx={{ color: 'var(--beer-amber)' }}
                        >
                          <AddIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
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
                        sx={{ color: 'var(--beer-amber)', mr: 1 }}
                      >
                        <AcceptIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleRejectRequest(request.id)}
                        sx={{ color: 'var(--text-secondary)' }}
                      >
                        <RejectIcon />
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
    </Box>
  );
} 