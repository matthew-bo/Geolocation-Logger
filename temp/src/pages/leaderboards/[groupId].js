import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  PersonAdd as AddFriendIcon,
  ArrowBack as BackIcon,
  Flag as ChallengeIcon,
  EmojiEvents as TrophyIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { db } from '../../config/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore';
import { friendService } from '../../services/friendService';
import CreateChallengeDialog from '../../components/leaderboard/CreateChallengeDialog';

// Define challenge types
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

// Reset frequency options
const RESET_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'never', label: 'Never' },
];

// Medal colors for top 3 positions
const MEDALS = {
  0: { color: '#FFD700', label: '1st Place' }, // Gold
  1: { color: '#C0C0C0', label: '2nd Place' }, // Silver
  2: { color: '#CD7F32', label: '3rd Place' }, // Bronze
};

// Add this helper function at the top level
const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};

export default function GroupLeaderboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { groupId } = router.query;
  const [group, setGroup] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createChallengeOpen, setCreateChallengeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [resetFrequency, setResetFrequency] = useState('weekly');
  const [userFriends, setUserFriends] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeDetailsOpen, setChallengeDetailsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (groupId && user) {
      fetchGroupData();
      fetchUserFriends();
      fetchActiveChallenges();
    }
  }, [groupId, user]);

  const getStartDate = (frequency, lastReset) => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'weekly':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return new Date(weekStart.setHours(0, 0, 0, 0));
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
      case 'never':
        return lastReset;
      default:
        return lastReset;
    }
  };

  const calculateMemberStats = (drinks, members) => {
    const stats = members.map(member => {
      const memberDrinks = drinks.filter(drink => drink.userId === member.id);
      
      // Calculate max beers in one day
      const drinksByDay = memberDrinks.reduce((acc, drink) => {
        const day = new Date(drink.timestamp.toDate()).toDateString();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});
      const maxBeersInDay = Math.max(0, ...Object.values(drinksByDay));

      // Calculate average beers per drinking day
      const drinkingDays = Object.keys(drinksByDay).length;
      const avgBeersPerDay = drinkingDays > 0 
        ? (memberDrinks.length / drinkingDays).toFixed(1) 
        : 0;

      // Calculate favorite drinking days
      const drinksByDayOfWeek = memberDrinks.reduce((acc, drink) => {
        const dayOfWeek = new Date(drink.timestamp.toDate()).getDay();
        acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
        return acc;
      }, {});
      const favoriteDayOfWeek = Object.entries(drinksByDayOfWeek)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const favoriteDay = favoriteDayOfWeek !== undefined ? weekDays[favoriteDayOfWeek] : '-';

      // Calculate favorite drinking time
      const drinksByHour = memberDrinks.reduce((acc, drink) => {
        const hour = new Date(drink.timestamp.toDate()).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});
      const favoriteHour = Object.entries(drinksByHour)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      const favoriteTime = favoriteHour !== undefined 
        ? `${favoriteHour.padStart(2, '0')}:00` 
        : '-';

      // Calculate consecutive days
      const sortedDays = Object.keys(drinksByDay).sort();
      let maxStreak = 0;
      let currentStreak = 0;
      let prevDay = null;

      sortedDays.forEach(day => {
        const currentDate = new Date(day);
        if (!prevDay) {
          currentStreak = 1;
        } else {
          const prevDate = new Date(prevDay);
          const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
        prevDay = day;
      });

      // Calculate current streak
      let currentStreakCount = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (drinksByDay[today]) {
        currentStreakCount = 1;
        let checkDate = yesterday;
        while (drinksByDay[checkDate]) {
          currentStreakCount++;
          checkDate = new Date(new Date(checkDate).getTime() - 86400000).toDateString();
        }
      } else if (drinksByDay[yesterday]) {
        currentStreakCount = 1;
        let checkDate = new Date(Date.now() - 2 * 86400000).toDateString();
        while (drinksByDay[checkDate]) {
          currentStreakCount++;
          checkDate = new Date(new Date(checkDate).getTime() - 86400000).toDateString();
        }
      }

      return {
        ...member,
        totalBeers: memberDrinks.length,
        maxBeersInDay,
        avgBeersPerDay,
        consecutiveDays: maxStreak,
        currentStreak: currentStreakCount,
        favoriteDay,
        favoriteTime,
        drinkingDays,
        lastDrink: memberDrinks[0]?.timestamp.toDate() || null,
      };
    });

    return stats;
  };

  const fetchGroupData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch group details
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }
      const groupData = groupDoc.data();
      setGroupName(groupData.name);
      setResetFrequency(groupData.resetFrequency);

      // Fetch member details
      const memberPromises = groupData.members.map(async memberId => {
        const userDoc = await getDoc(doc(db, 'users', memberId));
        return {
          id: memberId,
          ...userDoc.data()
        };
      });
      const members = await Promise.all(memberPromises);

      // Fetch drinks for ranking
      const now = new Date();
      const startDate = getStartDate(groupData.resetFrequency, groupData.lastReset.toDate());
      
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', 'in', groupData.members),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      );
      const drinksSnapshot = await getDocs(drinksQuery);
      const drinks = drinksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate rankings
      const memberStats = calculateMemberStats(drinks, members);
      const sortedRankings = memberStats.sort((a, b) => b.totalBeers - a.totalBeers);

      setGroup({ ...groupData, id: groupId, members });
      setRankings(sortedRankings);
    } catch (error) {
      console.error('Error fetching group data:', error);
      setError(error.message || 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFriends = async () => {
    try {
      const friends = await friendService.getFriends(user.uid);
      setUserFriends(friends);
    } catch (error) {
      console.error('Error fetching user friends:', error);
    }
  };

  const fetchActiveChallenges = async () => {
    try {
      const challengesQuery = query(
        collection(db, 'challenges'),
        where('groupId', '==', groupId),
        where('status', '==', 'active'),
        where('endDate', '>', new Date())
      );
      const snapshot = await getDocs(challengesQuery);
      const activeChallenges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChallenges(activeChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const handleAddFriend = async (memberId) => {
    try {
      await friendService.sendFriendRequest(user.uid, memberId);
      // Create notification for the friend request
      await addDoc(collection(db, 'notifications'), {
        userId: memberId,
        type: 'friend_request',
        message: `You have a new friend request`,
        read: false,
        createdAt: serverTimestamp(),
      });
      // Refresh friends list
      fetchUserFriends();
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(memberId)
      });

      await addDoc(collection(db, 'notifications'), {
        userId: memberId,
        type: 'group_remove',
        message: `You've been removed from the group "${group.name}"`,
        read: false,
        createdAt: serverTimestamp(),
      });

      if (memberId === group.creatorId) {
        const remainingMembers = group.members.filter(id => id !== memberId);
        if (remainingMembers.length > 0) {
          await updateDoc(groupRef, {
            creatorId: remainingMembers[0]
          });
        }
      }

      fetchGroupData();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!groupName.trim()) return;
    setSettingsLoading(true);
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        name: groupName.trim(),
        resetFrequency,
        lastReset: serverTimestamp()
      });

      // Notify members about the change
      const notifications = group.members.map(memberId => ({
        userId: memberId,
        type: 'group_update',
        message: `Group "${groupName.trim()}" settings have been updated`,
        read: false,
        createdAt: serverTimestamp(),
      }));

      await Promise.all(notifications.map(notification => 
        addDoc(collection(db, 'notifications'), notification)
      ));

      fetchGroupData();
      setSettingsOpen(false);
    } catch (error) {
      console.error('Error updating group:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleOpenChallengeDetails = (challenge) => {
    // First, we need to make sure we have the complete member data for all participants
    const enhancedParticipants = challenge.participants.map(participant => {
      // Find the member data from the group members array
      const memberData = group.members.find(m => m.id === participant.userId);
      
      return {
        ...participant,
        username: memberData?.username || memberData?.email?.split('@')[0] || 'Unknown User',
        isCurrentUser: participant.userId === user.uid
      };
    });
    
    // Sort participants by progress in descending order
    const sortedParticipants = [...enhancedParticipants].sort((a, b) => b.progress - a.progress);
    
    // Set ranking position for each participant
    const rankedParticipants = sortedParticipants.map((participant, index) => ({
      ...participant,
      rank: index + 1
    }));
    
    setSelectedChallenge({
      ...challenge,
      participants: rankedParticipants
    });
    setChallengeDetailsOpen(true);
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

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        pt: 10, 
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push('/leaderboards')}
          sx={{ color: 'var(--beer-amber)' }}
        >
          Back to Leaderboards
        </Button>
      </Box>
    );
  }

  const isCreator = group?.creatorId === user?.uid;

  return (
    <Box sx={{ minHeight: '100vh', pt: 10, px: 2 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => router.push('/leaderboards')}
              sx={{ color: 'var(--text-secondary)' }}
            >
              <BackIcon />
            </IconButton>
            <Typography variant="h4" className="logo-text">
              {group.name}
            </Typography>
            <Tooltip title="Group Settings">
              <IconButton
                onClick={() => setSettingsOpen(true)}
                sx={{ color: 'var(--beer-amber)' }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Leaderboard Table */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            bgcolor: 'var(--background)',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            mb: 4
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="50px" sx={{ 
                  color: 'var(--text-secondary)',
                  fontWeight: 'bold',
                  borderBottom: '2px solid var(--beer-amber)'
                }}>Rank</TableCell>
                <TableCell width="50px"></TableCell>
                <TableCell sx={{ 
                  color: 'var(--text-secondary)',
                  fontWeight: 'bold',
                  borderBottom: '2px solid var(--beer-amber)'
                }}>Member</TableCell>
                <TableCell align="right" sx={{ 
                  color: 'var(--text-secondary)',
                  fontWeight: 'bold',
                  borderBottom: '2px solid var(--beer-amber)',
                  display: { xs: 'none', sm: 'table-cell' }
                }}>
                  <Tooltip title="Total beers consumed during the current period">
                    <span>Total Beers</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right" sx={{ 
                  color: 'var(--text-secondary)',
                  fontWeight: 'bold',
                  borderBottom: '2px solid var(--beer-amber)',
                  display: { xs: 'none', md: 'table-cell' }
                }}>
                  <Tooltip title="Average beers per drinking day (days when at least one beer was logged)">
                    <span>Avg/Day</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right" sx={{ 
                  color: 'var(--text-secondary)',
                  fontWeight: 'bold',
                  borderBottom: '2px solid var(--beer-amber)',
                  display: { xs: 'none', md: 'table-cell' }
                }}>
                  <Tooltip title="Most beers consumed in a single day">
                    <span>Record</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right" sx={{ 
                  color: 'var(--text-secondary)',
                  fontWeight: 'bold',
                  borderBottom: '2px solid var(--beer-amber)',
                  display: { xs: 'none', lg: 'table-cell' }
                }}>
                  <Tooltip title="Longest streak of consecutive days drinking">
                    <span>Streak</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right" sx={{ 
                  color: 'var(--text-secondary)',
                  fontWeight: 'bold',
                  borderBottom: '2px solid var(--beer-amber)',
                  display: { xs: 'none', lg: 'table-cell' }
                }}>
                  <Tooltip title="Most common time of day for drinking">
                    <span>Peak Time</span>
                  </Tooltip>
                </TableCell>
                {isCreator && <TableCell width="50px" sx={{ borderBottom: '2px solid var(--beer-amber)' }}></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rankings.map((member, index) => {
                const medal = MEDALS[index];
                const isCurrentUser = member.id === user?.uid;
                const lastDrinkDate = member.lastDrink 
                  ? new Date(member.lastDrink).toLocaleDateString()
                  : '-';
                const startDate = getStartDate(group.resetFrequency, group.lastReset.toDate());

                return (
                  <TableRow
                    key={member.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      bgcolor: isCurrentUser ? 'rgba(251, 192, 45, 0.1)' : 'var(--glass-background)',
                      '&:nth-of-type(odd)': {
                        bgcolor: isCurrentUser ? 'rgba(251, 192, 45, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      },
                      '&:hover': {
                        bgcolor: isCurrentUser ? 'rgba(251, 192, 45, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      },
                      transition: 'background-color 0.2s ease',
                      '& td': { color: 'var(--text-primary)' }
                    }}
                  >
                    <TableCell>
                      {medal ? (
                        <Tooltip title={`${medal.label} - Ranked #${index + 1} in the group`}>
                          <TrophyIcon sx={{ color: medal.color }} />
                        </Tooltip>
                      ) : (
                        <Tooltip title={`Ranked #${index + 1} in the group`}>
                          <Typography color="var(--text-secondary)">
                            {index + 1}
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.id !== user.uid && !userFriends.find(f => f.id === member.id) && (
                        <Tooltip title="Add Friend">
                          <IconButton
                            size="small"
                            onClick={() => handleAddFriend(member.id)}
                            sx={{ color: 'var(--beer-amber)' }}
                          >
                            <AddFriendIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          className={isCurrentUser ? 'logo-text' : undefined}
                          sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            fontWeight: medal ? 600 : 400
                          }}
                        >
                          {member.username || member.email?.split('@')[0]}
                        </Typography>
                        {member.id === group.creatorId && (
                          <Tooltip title="Group Leader - Can manage group settings and members">
                            <AdminIcon 
                              sx={{ 
                                color: 'var(--beer-amber)',
                                fontSize: '1.2rem'
                              }} 
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        display: { xs: 'none', sm: 'table-cell' },
                        color: medal ? medal.color : 'var(--text-primary)',
                        fontWeight: medal ? 600 : 400
                      }}
                    >
                      <Tooltip 
                        title={
                          `Last drink: ${lastDrinkDate}
                          Period: ${formatDateRange(startDate, new Date())}
                          Total drinking days: ${member.drinkingDays}`
                        }
                      >
                        <span>{member.totalBeers}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        display: { xs: 'none', md: 'table-cell' },
                        color: 'var(--text-primary)'
                      }}
                    >
                      <Tooltip 
                        title={
                          `${member.drinkingDays} drinking days
                          ${member.totalBeers} total beers
                          Average: ${member.avgBeersPerDay} beers per drinking day`
                        }
                      >
                        <span>{member.avgBeersPerDay}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        display: { xs: 'none', md: 'table-cell' },
                        color: 'var(--text-primary)'
                      }}
                    >
                      <Tooltip title={`Record: ${member.maxBeersInDay} beers in one day`}>
                        <span>{member.maxBeersInDay}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        display: { xs: 'none', lg: 'table-cell' },
                        color: 'var(--text-primary)'
                      }}
                    >
                      <Tooltip 
                        title={
                          `Current streak: ${member.currentStreak} days
                          Best streak: ${member.consecutiveDays} days`
                        }
                      >
                        <span>{member.consecutiveDays}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        display: { xs: 'none', lg: 'table-cell' },
                        color: 'var(--text-primary)'
                      }}
                    >
                      <Tooltip 
                        title={
                          `Favorite day: ${member.favoriteDay}
                          Favorite time: ${member.favoriteTime}`
                        }
                      >
                        <span>{member.favoriteTime}</span>
                      </Tooltip>
                    </TableCell>
                    {isCreator && (
                      <TableCell>
                        {member.id !== user.uid && (
                          <Tooltip title="Remove Member">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveMember(member.id)}
                              sx={{ 
                                color: 'rgba(211, 47, 47, 0.7)',
                                '&:hover': {
                                  color: 'rgb(211, 47, 47)',
                                  bgcolor: 'rgba(211, 47, 47, 0.1)'
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Mobile Stats View */}
        {isMobile && (
          <Box sx={{ mt: 2, mb: 4 }}>
            {rankings.map((member, index) => {
              const medal = MEDALS[index];
              const isCurrentUser = member.id === user?.uid;
              const lastDrinkDate = member.lastDrink 
                ? new Date(member.lastDrink).toLocaleDateString()
                : '-';
              const startDate = getStartDate(group.resetFrequency, group.lastReset.toDate());

              return (
                <Card
                  key={member.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: isCurrentUser ? 'rgba(251, 192, 45, 0.1)' : 'var(--glass-background)',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {medal ? (
                      <Tooltip title={`${medal.label} - Ranked #${index + 1} in the group`}>
                        <TrophyIcon sx={{ color: medal.color }} />
                      </Tooltip>
                    ) : (
                      <Tooltip title={`Ranked #${index + 1} in the group`}>
                        <Typography color="var(--text-secondary)">#{index + 1}</Typography>
                      </Tooltip>
                    )}
                    <Typography
                      className={isCurrentUser ? 'logo-text' : undefined}
                      sx={{ fontWeight: medal ? 600 : 400 }}
                    >
                      {member.username || member.email?.split('@')[0]}
                    </Typography>
                    {member.id === group.creatorId && (
                      <Tooltip title="Group Leader - Can manage group settings and members">
                        <AdminIcon sx={{ color: 'var(--beer-amber)', fontSize: '1.2rem' }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Tooltip 
                        title={
                          `Period: ${formatDateRange(startDate, new Date())}
                          Total drinking days: ${member.drinkingDays}`
                        }
                      >
                        <Typography variant="body2" color="var(--text-secondary)">
                          Total: <span style={{ color: medal?.color }}>{member.totalBeers}</span>
                        </Typography>
                      </Tooltip>
                      <Tooltip 
                        title={
                          `${member.drinkingDays} drinking days
                          ${member.totalBeers} total beers`
                        }
                      >
                        <Typography variant="body2" color="var(--text-secondary)">
                          Avg: {member.avgBeersPerDay}/day
                        </Typography>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Tooltip title={`Record: ${member.maxBeersInDay} beers in one day`}>
                        <Typography variant="body2" color="var(--text-secondary)">
                          Record: {member.maxBeersInDay}
                        </Typography>
                      </Tooltip>
                      <Tooltip 
                        title={
                          `Current streak: ${member.currentStreak} days
                          Best streak: ${member.consecutiveDays} days`
                        }
                      >
                        <Typography variant="body2" color="var(--text-secondary)">
                          Streak: {member.currentStreak}
                        </Typography>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Tooltip 
                        title={
                          `Favorite day: ${member.favoriteDay}
                          Favorite time: ${member.favoriteTime}`
                        }
                      >
                        <Typography variant="body2" color="var(--text-secondary)">
                          Peak: {member.favoriteDay} {member.favoriteTime}
                        </Typography>
                      </Tooltip>
                      <Tooltip title={`Last recorded drink`}>
                        <Typography variant="body2" color="var(--text-secondary)">
                          Last: {lastDrinkDate}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    {member.id !== user.uid && !userFriends.find(f => f.id === member.id) && (
                      <IconButton
                        size="small"
                        onClick={() => handleAddFriend(member.id)}
                        sx={{ color: 'var(--beer-amber)' }}
                      >
                        <AddFriendIcon />
                      </IconButton>
                    )}
                    {isCreator && member.id !== user.uid && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveMember(member.id)}
                        sx={{ 
                          color: 'rgba(211, 47, 47, 0.7)',
                          ml: 1,
                          '&:hover': {
                            color: 'rgb(211, 47, 47)',
                            bgcolor: 'rgba(211, 47, 47, 0.1)'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}

        {/* Active Challenges */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2 
          }}>
            <Typography variant="h6" className="logo-text">
              Challenges
            </Typography>
            <Button
              variant="contained"
              startIcon={<ChallengeIcon />}
              onClick={() => setCreateChallengeOpen(true)}
              sx={{
                bgcolor: 'var(--beer-amber)',
                '&:hover': { bgcolor: 'var(--copper)' }
              }}
            >
              Create Challenge
            </Button>
          </Box>

          {challenges.length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr',
                sm: 'repeat(auto-fill, minmax(300px, 1fr))'
              },
              gap: 2,
            }}>
              {challenges.map(challenge => {
                // Find the user in the participants array directly
                const userParticipant = challenge.participants.find(p => p.userId === user.uid);
                const participantProgress = userParticipant?.progress || 0;
                const isStreak = challenge.type === 'streak';
                const progress = isStreak 
                  ? `${participantProgress} days`
                  : `${participantProgress}/${challenge.goal} beers`;
                const progressPercent = isStreak 
                  ? (participantProgress / 30) * 100 // Using 30 days as max for visualization
                  : (participantProgress / challenge.goal) * 100;
                
                // Calculate user's ranking in this challenge - adding 1 to convert from 0-indexed to 1-indexed
                const sortedParticipants = [...challenge.participants].sort((a, b) => b.progress - a.progress);
                const userRank = sortedParticipants.findIndex(p => p.userId === user.uid) + 1;
                const totalParticipants = challenge.participants.length;

                return (
                  <Card
                    key={challenge.id}
                    sx={{
                      bgcolor: 'var(--glass-background)',
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>
                        {challenge.name}
                      </Typography>
                      <Chip 
                        label={`#${userRank} of ${totalParticipants}`}
                        size="small"
                        sx={{ 
                          bgcolor: userRank <= 3 ? MEDALS[userRank-1]?.color || 'grey' : 'grey',
                          color: userRank <= 3 ? 'black' : 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                      {CHALLENGE_TYPES.find(t => t.value === challenge.type)?.description}
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ color: 'var(--text-primary)', mb: 0.5 }}>
                        Your Progress: {progress}
                      </Typography>
                      <Box sx={{ 
                        width: '100%', 
                        height: 4, 
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: `${Math.min(progressPercent, 100)}%`,
                          height: '100%',
                          bgcolor: 'var(--beer-amber)',
                          transition: 'width 0.3s ease'
                        }} />
                      </Box>
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 'auto',
                      pt: 1
                    }}>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                        Ends: {new Date(challenge.endDate.seconds * 1000).toLocaleDateString()}
                      </Typography>
                      <Button
                        size="small"
                        sx={{ 
                          color: 'var(--beer-amber)',
                          '&:hover': { bgcolor: 'rgba(251, 192, 45, 0.1)' }
                        }}
                        onClick={() => handleOpenChallengeDetails(challenge)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          ) : (
            <Card sx={{ 
              p: 3, 
              bgcolor: 'var(--glass-background)',
              borderRadius: 2,
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <Typography color="var(--text-secondary)" sx={{ mb: 2 }}>
                No active challenges
              </Typography>
              <Typography variant="body2" color="var(--text-secondary)">
                Create a challenge to compete with your group members!
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
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
        <DialogTitle>Group Settings</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            disabled={!isCreator}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Reset Frequency</InputLabel>
            <Select
              value={resetFrequency}
              label="Reset Frequency"
              onChange={(e) => setResetFrequency(e.target.value)}
              disabled={!isCreator}
            >
              {RESET_FREQUENCIES.map(({ value, label }) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {!isCreator && (
            <Typography color="var(--text-secondary)" sx={{ mt: 2 }}>
              Only the group leader can modify these settings
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Cancel
          </Button>
          {isCreator && (
            <Button
              onClick={handleSaveSettings}
              disabled={settingsLoading || !groupName.trim()}
              sx={{ 
                color: 'var(--beer-amber)',
                '&:hover': { bgcolor: 'rgba(251, 192, 45, 0.1)' },
              }}
            >
              {settingsLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Create Challenge Dialog */}
      <CreateChallengeDialog
        open={createChallengeOpen}
        onClose={() => setCreateChallengeOpen(false)}
        group={group}
        onChallengeCreated={fetchGroupData}
      />

      {/* Challenge Details Dialog */}
      <Dialog
        open={challengeDetailsOpen}
        onClose={() => setChallengeDetailsOpen(false)}
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
        {selectedChallenge && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div" className="logo-text">
                  {selectedChallenge.name}
                </Typography>
                <Chip 
                  label={CHALLENGE_TYPES.find(t => t.value === selectedChallenge.type)?.label || 'Challenge'} 
                  color="primary"
                  sx={{ 
                    bgcolor: 'var(--beer-amber)',
                    color: 'black',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2, color: 'var(--text-secondary)' }}>
                {CHALLENGE_TYPES.find(t => t.value === selectedChallenge.type)?.description}
              </Typography>
              
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'var(--text-primary)' }}>
                Ends: {new Date(selectedChallenge.endDate.seconds * 1000).toLocaleDateString()}
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'var(--text-primary)' }}>
                Leaderboard
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {selectedChallenge.participants.map((participant, index) => {
                  const isCurrentUser = participant.isCurrentUser;
                  const isStreak = selectedChallenge.type === 'streak';
                  const progressLabel = isStreak 
                    ? `${participant.progress} days` 
                    : `${participant.progress}/${selectedChallenge.goal} beers`;
                  
                  return (
                    <Box
                      key={participant.userId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: isCurrentUser ? 'rgba(251, 192, 45, 0.1)' : 'var(--glass-background)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <Box sx={{ 
                        mr: 2, 
                        width: 28, 
                        height: 28, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: index < 3 ? MEDALS[index].color : 'rgba(255,255,255,0.1)',
                        color: index < 3 ? 'black' : 'var(--text-primary)',
                        fontWeight: 'bold'
                      }}>
                        {participant.rank}
                      </Box>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ 
                          color: 'var(--text-primary)',
                          fontWeight: isCurrentUser ? 'bold' : 'normal',
                        }}>
                          {participant.username}
                          {isCurrentUser && ' (You)'}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 0.5
                        }}>
                          <Box sx={{ 
                            flexGrow: 1, 
                            height: 4, 
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 1,
                            mr: 1,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: isStreak ? `${Math.min((participant.progress / 30) * 100, 100)}%` : `${Math.min((participant.progress / selectedChallenge.goal) * 100, 100)}%`,
                              height: '100%',
                              bgcolor: 'var(--beer-amber)',
                            }} />
                          </Box>
                          <Typography variant="body2" color="var(--text-secondary)">
                            {progressLabel}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setChallengeDetailsOpen(false)}
                sx={{ color: 'var(--text-primary)' }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
} 