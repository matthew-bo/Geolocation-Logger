import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Fade,
  Dialog,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  EmojiEvents as TrophyIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import CreateGroupDialog from '../components/leaderboard/CreateGroupDialog';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Bubble component reused from other pages
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

export default function Leaderboards() {
  const { user } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Generate random bubbles
  const bubbles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 20 + 10,
    left: Math.random() * 100,
    delay: Math.random() * 2
  }));

  useEffect(() => {
    if (user) {
      fetchUserGroups();
    }
  }, [user]);

  const fetchUserGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      // Query groups where user is a member
      const groupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(groupsQuery);
      const groupsData = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        // Fetch member count
        const memberCount = data.members.length;
        return {
          id: doc.id,
          ...data,
          memberCount
        };
      }));
      
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewGroup = (groupId) => {
    router.push(`/leaderboards/${groupId}`);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
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
            <TrophyIcon sx={{ fontSize: 40, color: 'var(--beer-amber)' }} />
          </IconButton>
          <Typography variant="h4" className="logo-text" gutterBottom>
            Leaderboards
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Card className="glass-card" sx={{ mb: 4 }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Typography variant="h6" color="var(--beer-amber)">
                Your Groups
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  bgcolor: 'var(--beer-amber)',
                  '&:hover': { bgcolor: 'var(--copper)' }
                }}
              >
                Create Group
              </Button>
            </Box>

            <Fade in={true}>
              <List>
                {groups.map((group) => (
                  <ListItem
                    key={group.id}
                    className="glass-card"
                    sx={{ 
                      mb: 2,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      }
                    }}
                    onClick={() => handleViewGroup(group.id)}
                  >
                    <ListItemText
                      primary={group.name}
                      secondary={`${group.memberCount} members • Resets ${group.resetFrequency}`}
                      primaryTypographyProps={{
                        className: 'logo-text',
                        sx: { fontSize: '1.1rem' }
                      }}
                      secondaryTypographyProps={{
                        sx: { color: 'var(--text-secondary)' }
                      }}
                    />
                    <ChevronRightIcon sx={{ color: 'var(--beer-amber)' }} />
                  </ListItem>
                ))}
                {groups.length === 0 && (
                  <Typography 
                    color="var(--text-secondary)" 
                    sx={{ textAlign: 'center', fontStyle: 'italic' }}
                  >
                    No groups yet. Create one to start competing with friends!
                  </Typography>
                )}
              </List>
            </Fade>
          </Box>
        </Card>
      </Box>

      <CreateGroupDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onGroupCreated={fetchUserGroups}
      />
    </Box>
  );
} 