import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  Avatar,
  Button,
  Grid,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  LocalBar as BeerIcon,
  People as FriendsIcon,
  Map as MapIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, deleteDoc, updateDoc } from 'firebase/firestore';
import { locationService } from '../services/locationService';
import { friendService } from '../services/friendService';
import DrinkGraph from '../components/DrinkGraph';
import { useRouter } from 'next/router';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const { userId: profileUserId } = router.query;
  const [stats, setStats] = useState({
    totalDrinks: 0,
    uniqueBeers: 0,
    favoriteBeer: null,
    averageRating: 0,
    friends: 0,
    topPlaces: [],
    visitedCities: [],
    visitedStates: [],
    visitedCountries: [],
  });
  const [userData, setUserData] = useState(null);
  const [recentDrinks, setRecentDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [drinkToDelete, setDrinkToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLocationOpen, setEditLocationOpen] = useState(false);
  const [drinkToEditLocation, setDrinkToEditLocation] = useState(null);
  const [customLocation, setCustomLocation] = useState('');
  const [editLocationLoading, setEditLocationLoading] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  const isOwnProfile = !profileUserId || profileUserId === user?.uid;
  const targetUserId = profileUserId || user?.uid;

  useEffect(() => {
    if (targetUserId) {
      fetchUserData();
      if (!isOwnProfile && user) {
        checkFriendshipStatus();
      }
    }
  }, [targetUserId, user]);

  const checkFriendshipStatus = async () => {
    try {
      // Check if they are already friends
      const areFriends = await friendService.areFriends(user.uid, targetUserId);
      if (areFriends) {
        setFriendshipStatus('friends');
        return;
      }

      // Check for pending requests
      const sentRequests = await friendService.getSentRequests(user.uid);
      const pendingRequests = await friendService.getPendingRequests(user.uid);
      
      const hasSentRequest = sentRequests.some(req => req.receiverId === targetUserId);
      const hasReceivedRequest = pendingRequests.some(req => req.senderId === targetUserId);

      if (hasSentRequest) {
        setFriendshipStatus('request_sent');
      } else if (hasReceivedRequest) {
        setFriendshipStatus('request_received');
      } else {
        setFriendshipStatus('not_friends');
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
      setFriendshipStatus('error');
    }
  };

  const handleFriendAction = async () => {
    if (friendActionLoading) return;
    setFriendActionLoading(true);

    try {
      switch (friendshipStatus) {
        case 'not_friends':
          await friendService.sendFriendRequest(user.uid, targetUserId);
          setFriendshipStatus('request_sent');
          break;
        case 'friends':
          await friendService.removeFriend(user.uid, targetUserId);
          setFriendshipStatus('not_friends');
          break;
        case 'request_received':
          // Find the request ID and accept it
          const pendingRequests = await friendService.getPendingRequests(user.uid);
          const request = pendingRequests.find(req => req.senderId === targetUserId);
          if (request) {
            await friendService.acceptFriendRequest(request.id);
            setFriendshipStatus('friends');
          }
          break;
        case 'request_sent':
          // Cancel the request (implement this in friendService if needed)
          const sentRequests = await friendService.getSentRequests(user.uid);
          const sentRequest = sentRequests.find(req => req.receiverId === targetUserId);
          if (sentRequest) {
            await friendService.rejectFriendRequest(sentRequest.id);
            setFriendshipStatus('not_friends');
          }
          break;
      }
    } catch (error) {
      console.error('Error handling friend action:', error);
      setError('Failed to perform friend action. Please try again.');
    } finally {
      setFriendActionLoading(false);
    }
  };

  // Force refresh data function
  const refreshData = () => {
    if (targetUserId) {
      fetchUserData();
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchUserStats(),
        fetchRecentDrinks()
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userDocRef = doc(db, 'users', targetUserId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const fetchRecentDrinks = async () => {
    try {
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', targetUserId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const drinksSnapshot = await getDocs(drinksQuery);
      const drinks = drinksSnapshot.docs.map(doc => {
        const data = doc.data();
        // Handle Firestore timestamps correctly
        const timestamp = data.timestamp?.toDate?.() 
          ? data.timestamp.toDate() 
          : new Date(data.timestamp || Date.now());
          
        return {
          id: doc.id,
          ...data,
          timestamp
        };
      });
      
      setRecentDrinks(drinks);
    } catch (error) {
      console.error('Error fetching recent drinks:', error);
      throw error;
    }
  };

  const handleDeleteDrink = (drink) => {
    setDrinkToDelete(drink);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteDrink = async () => {
    if (!drinkToDelete) return;
    
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'drinks', drinkToDelete.id));
      setRecentDrinks(recentDrinks.filter(drink => drink.id !== drinkToDelete.id));
      // Refresh stats after deletion
      fetchUserStats();
    } catch (error) {
      console.error('Error deleting drink:', error);
      setError('Failed to delete drink. Please try again.');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setDrinkToDelete(null);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Fetch drinks
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', targetUserId),
        orderBy('timestamp', 'desc')
      );
      const drinksSnapshot = await getDocs(drinksQuery);
      const drinks = drinksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Fetched drinks for stats:', drinks.length);
      
      // Sample the first few drinks to see their structure
      if (drinks.length > 0) {
        console.log('Sample drink data:', 
          drinks.slice(0, 3).map(drink => ({
            id: drink.id,
            brand: drink.brand,
            hasLocation: !!drink.location,
            hasPlaceInfo: !!drink.placeInfo,
            placeName: drink.placeInfo?.placeName,
            address: drink.placeInfo?.address,
            placeInfo: drink.placeInfo
          }))
        );
      }

      // Fetch friend count
      const friendsQuery = query(
        collection(db, 'friendships'),
        where('userId', '==', targetUserId)
      );
      const friendsSnapshot = await getDocs(friendsQuery);

      // Calculate stats
      const uniqueBeers = [...new Set(drinks.map(drink => drink.brand))];
      const ratings = drinks.map(drink => drink.rating).filter(rating => rating > 0);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b) / ratings.length : 0;

      // Find favorite beer
      const beerCounts = drinks.reduce((acc, drink) => {
        if (drink.brand) {
          acc[drink.brand] = (acc[drink.brand] || 0) + 1;
        }
        return acc;
      }, {});
      
      const sortedBeers = Object.entries(beerCounts).sort((a, b) => b[1] - a[1]);
      const favoriteBeer = sortedBeers.length > 0 ? sortedBeers[0][0] : null;

      // Use the locationService for location statistics
      const locationStats = locationService.getLocationStats(drinks);
      console.log("Location stats from service:", locationStats);
      
      // Log the top places to debug
      if (locationStats.topPlaces && locationStats.topPlaces.length > 0) {
        console.log("Top places names:", locationStats.topPlaces.map(p => p.name));
      }

      setStats({
        totalDrinks: drinks.length,
        uniqueBeers: uniqueBeers.length,
        favoriteBeer,
        averageRating: avgRating,
        friends: friendsSnapshot.size,
        // Add location stats
        ...locationStats,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  };

  const handleEditLocation = (drink) => {
    setDrinkToEditLocation(drink);
    setCustomLocation(drink.placeInfo?.customName || drink.placeInfo?.placeName || '');
    setEditLocationOpen(true);
  };

  const handleSaveLocation = async () => {
    if (!drinkToEditLocation) return;
    
    setEditLocationLoading(true);
    try {
      // Get existing place info or create new object
      const placeInfo = drinkToEditLocation.placeInfo || {};
      
      // Update with custom name
      const updatedPlaceInfo = {
        ...placeInfo,
        customName: customLocation,
        isCustom: true
      };
      
      console.log('Updating drink location with:', {
        drinkId: drinkToEditLocation.id,
        oldPlaceInfo: placeInfo,
        newPlaceInfo: updatedPlaceInfo
      });
      
      // Update in Firestore
      const drinkRef = doc(db, 'drinks', drinkToEditLocation.id);
      await updateDoc(drinkRef, { placeInfo: updatedPlaceInfo });
      
      // Update local state
      setRecentDrinks(recentDrinks.map(drink => {
        if (drink.id === drinkToEditLocation.id) {
          return {
            ...drink,
            placeInfo: updatedPlaceInfo
          };
        }
        return drink;
      }));
      
      // Refresh stats to update top places
      await fetchUserStats();
      
      setEditLocationOpen(false);
      setEditLocationLoading(false);
      setDrinkToEditLocation(null);
      setCustomLocation('');
    } catch (error) {
      console.error('Error updating location:', error);
      setEditLocationLoading(false);
    }
  };

  // Let's add some debugging for the places data
  useEffect(() => {
    if (stats.topPlaces && stats.topPlaces.length > 0) {
      console.log("Top places in stats:", stats.topPlaces);
    }
  }, [stats.topPlaces]);

  // Add useEffect to log stats when they change
  useEffect(() => {
    if (stats.topPlaces && stats.topPlaces.length > 0) {
      console.log('Profile stats updated:', {
        topPlacesCount: stats.topPlaces.length,
        firstPlace: stats.topPlaces[0],
        allTopPlaces: stats.topPlaces
      });
    }
  }, [stats]);

  // Helper function to format a location name for display
  const formatLocationName = (name) => {
    // Check if the name is coordinates
    if (name && name.includes('Location (') && name.includes(', ')) {
      return "Unnamed Location";
    }
    return name;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore timestamp
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle regular date string or timestamp
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const getFriendActionButton = () => {
    if (isOwnProfile) return null;

    let buttonProps = {
      variant: 'contained',
      onClick: handleFriendAction,
      disabled: friendActionLoading,
      startIcon: friendActionLoading ? <CircularProgress size={20} /> : null,
      sx: { mt: 2 }
    };

    switch (friendshipStatus) {
      case 'friends':
        return (
          <Button
            {...buttonProps}
            color="success"
            startIcon={<CheckIcon />}
          >
            Friend
          </Button>
        );
      case 'request_sent':
        return (
          <Button
            {...buttonProps}
            color="warning"
            startIcon={<CancelIcon />}
          >
            Cancel Request
          </Button>
        );
      case 'request_received':
        return (
          <Button
            {...buttonProps}
            color="primary"
            startIcon={<CheckIcon />}
          >
            Accept Request
          </Button>
        );
      case 'not_friends':
        return (
          <Button
            {...buttonProps}
            color="primary"
            startIcon={<PersonAddIcon />}
          >
            Add Friend
          </Button>
        );
      case 'error':
        return (
          <Button
            {...buttonProps}
            color="primary"
            onClick={checkFriendshipStatus}
            startIcon={<PersonAddIcon />}
          >
            Add Friend
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pt: 10, px: 2 }}>
      <Container maxWidth="lg">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Card className="glass-card" sx={{ mb: 4, position: 'relative' }}>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'var(--beer-amber)',
                      fontSize: '2.5rem'
                    }}
                  >
                    {userData?.username?.[0]?.toUpperCase() || userData?.email?.[0]?.toUpperCase()}
                  </Avatar>
                </Box>
                
                <Typography variant="h4" gutterBottom>
                  {userData?.displayName || userData?.username || 'Anonymous Beer Lover'}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Member since {formatDate(userData?.createdAt)}
                </Typography>
                {getFriendActionButton()}
              </Box>
            </Card>

            {/* Stats Grid */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box className="stat-card">
                  <BeerIcon sx={{ fontSize: 40, color: 'var(--beer-amber)', mb: 1 }} />
                  <Typography className="stat-value">{stats.totalDrinks}</Typography>
                  <Typography className="stat-label">Total Beers</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className="stat-card">
                  <BeerIcon sx={{ fontSize: 40, color: 'var(--beer-amber)', mb: 1 }} />
                  <Typography className="stat-value">{stats.uniqueBeers}</Typography>
                  <Typography className="stat-label">Unique Beers</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className="stat-card">
                  <StarIcon sx={{ fontSize: 40, color: 'var(--beer-amber)', mb: 1 }} />
                  <Typography className="stat-value">
                    {stats.averageRating.toFixed(1)}
                  </Typography>
                  <Typography className="stat-label">Avg Rating</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className="stat-card">
                  <FriendsIcon sx={{ fontSize: 40, color: 'var(--beer-amber)', mb: 1 }} />
                  <Typography className="stat-value">{stats.friends}</Typography>
                  <Typography className="stat-label">Friends</Typography>
                </Box>
              </Grid>
              
              {/* New: Location Stats Card - Show even with minimal data */}
              <Grid item xs={12}>
                <Box className="drink-card" sx={{ mb: 4, p: 3 }}>
                  <Typography variant="h6" gutterBottom color="var(--text-secondary)">
                    Top Drinking Spots
                  </Typography>
                  
                  {stats.topPlaces && stats.topPlaces.length > 0 ? (
                    <Accordion 
                      sx={{ 
                        background: 'transparent', 
                        boxShadow: 'none', 
                        border: '1px solid var(--border-color)',
                        '&:before': { display: 'none' },
                        borderRadius: '8px'
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: 'var(--beer-amber)' }} />}
                        sx={{ flexDirection: 'row-reverse' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                          <LocationIcon sx={{ mr: 1, color: 'var(--beer-amber)' }} />
                          <Typography>
                            {/* Use formatter to prevent showing coordinates */}
                            {formatLocationName(stats.topPlaces[0].name)} ({stats.topPlaces[0].count} beers)
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List sx={{ p: 0 }}>
                          {stats.topPlaces.slice(1).map((place, index) => (
                            <ListItem key={index} sx={{ py: 1 }}>
                              <ListItemText 
                                primary={
                                  <Box>
                                    <Typography component="span" sx={{ mr: 1 }}>
                                      {formatLocationName(place.name)}
                                    </Typography>
                                    <Chip 
                                      label={`${place.count} beers`} 
                                      size="small" 
                                      sx={{ 
                                        bgcolor: 'var(--beer-amber)', 
                                        color: '#000',
                                        fontSize: '0.7rem'
                                      }} 
                                    />
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ) : (
                    <Typography variant="body2" color="var(--text-secondary)" gutterBottom>
                      Start logging drinks with locations to see your top spots!
                    </Typography>
                  )}
                  
                  <Grid container spacing={2} mt={2}>
                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="subtitle2" color="var(--text-secondary)" gutterBottom>
                          Cities Visited
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {stats.visitedCities && stats.visitedCities.length > 0 ? (
                            stats.visitedCities.map((city, index) => (
                              <Chip 
                                key={index} 
                                label={`${city.name} (${city.count})`} 
                                size="small" 
                                icon={<LocationIcon />}
                                sx={{ 
                                  bgcolor: 'rgba(251, 192, 45, 0.1)', 
                                  border: '1px solid var(--beer-amber)',
                                  color: 'var(--text-primary)',
                                }} 
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="var(--text-secondary)">
                              No cities recorded yet
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="subtitle2" color="var(--text-secondary)" gutterBottom>
                          States Visited
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {stats.visitedStates && stats.visitedStates.length > 0 ? (
                            stats.visitedStates.map((state, index) => (
                              <Chip 
                                key={index} 
                                label={`${state.name} (${state.count})`} 
                                size="small" 
                                icon={<LocationIcon />}
                                sx={{ 
                                  bgcolor: 'rgba(251, 192, 45, 0.1)', 
                                  border: '1px solid var(--beer-amber)',
                                  color: 'var(--text-primary)',
                                }} 
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="var(--text-secondary)">
                              No states recorded yet
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="subtitle2" color="var(--text-secondary)" gutterBottom>
                          Countries Visited
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {stats.visitedCountries && stats.visitedCountries.length > 0 ? (
                            stats.visitedCountries.map((country, index) => (
                              <Chip 
                                key={index} 
                                label={`${country.name} (${country.count})`} 
                                size="small"
                                icon={<LocationIcon />}
                                sx={{ 
                                  bgcolor: 'rgba(251, 192, 45, 0.1)', 
                                  border: '1px solid var(--beer-amber)',
                                  color: 'var(--text-primary)',
                                }} 
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="var(--text-secondary)">
                              No countries recorded yet
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>

            {/* Drink Analytics Graph */}
            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Drink Analytics
              </Typography>
              <DrinkGraph drinks={recentDrinks} />
            </Box>

            {/* Favorite Beer Card */}
            {stats.favoriteBeer && (
              <Box className="drink-card" sx={{ mb: 4, p: 4 }}>
                <Typography variant="h6" gutterBottom color="var(--text-secondary)">
                  Favorite Beer
                </Typography>
                <Typography variant="h4" className="logo-text">
                  {stats.favoriteBeer}
                </Typography>
              </Box>
            )}

            {/* Recent Activity Card */}
            <Box className="premium-card" sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="var(--beer-amber)">
                  Recent Activity
                </Typography>
                <Button 
                  onClick={refreshData}
                  sx={{ 
                    color: 'var(--beer-amber)', 
                    '&:hover': { color: 'var(--copper)' } 
                  }}
                >
                  Refresh
                </Button>
              </Box>
              {recentDrinks.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {recentDrinks.map((drink, index) => (
                    <React.Fragment key={drink.id}>
                      <ListItem alignItems="flex-start" sx={{ flexDirection: 'column' }}>
                        <Box sx={{ 
                          display: 'flex', 
                          width: '100%', 
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}>
                          <Box>
                            <Typography color="var(--text-primary)" sx={{ fontWeight: 'bold' }}>
                              {drink.brand || 'Unknown Brand'}
                            </Typography>
                            <Typography variant="body2" color="var(--text-secondary)">
                              {new Date(drink.timestamp).toLocaleString()}
                            </Typography>
                            
                            {/* Location information */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <LocationIcon sx={{ fontSize: '0.9rem', color: 'var(--text-secondary)', mr: 0.5 }} />
                              <Typography variant="body2" color="var(--text-secondary)" sx={{ display: 'flex', alignItems: 'center' }}>
                                {drink.placeInfo ? (
                                  <>
                                    {drink.placeInfo.customName || drink.placeInfo.placeName || 'Unknown Location'}
                                    <Tooltip title="Edit location name">
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleEditLocation(drink)}
                                        sx={{ ml: 0.5, p: 0.3 }}
                                      >
                                        <EditIcon sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                ) : (
                                  <>
                                    Unknown Location
                                    <Tooltip title="Add location name">
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleEditLocation(drink)}
                                        sx={{ ml: 0.5, p: 0.3 }}
                                      >
                                        <EditIcon sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteDrink(drink)}
                            sx={{ color: 'var(--text-secondary)' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < recentDrinks.length - 1 && (
                        <Divider component="li" sx={{ bgcolor: 'var(--border-color)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="var(--text-secondary)" sx={{ fontStyle: 'italic' }}>
                  No beers logged yet. Start logging your beer journey!
                </Typography>
              )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteConfirmOpen}
              onClose={() => setDeleteConfirmOpen(false)}
              aria-labelledby="delete-dialog-title"
              PaperProps={{
                sx: {
                  bgcolor: 'var(--background)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  '& .MuiDialogTitle-root': {
                    color: 'var(--text-primary)'
                  },
                  '& .MuiDialogContentText-root': {
                    color: 'var(--text-secondary)'
                  }
                }
              }}
            >
              <DialogTitle id="delete-dialog-title">
                Delete Beer Entry
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this beer entry? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={deleteLoading}
                  sx={{ color: 'var(--text-primary)' }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmDeleteDrink}
                  disabled={deleteLoading}
                  sx={{ 
                    color: 'rgb(211, 47, 47)',
                    '&:hover': {
                      bgcolor: 'rgba(211, 47, 47, 0.1)'
                    }
                  }}
                  startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* New: Edit Location Dialog */}
            <Dialog
              open={editLocationOpen}
              onClose={() => !editLocationLoading && setEditLocationOpen(false)}
            >
              <DialogTitle>Edit Location Name</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ mb: 2, color: 'var(--text-secondary)' }}>
                  Enter a descriptive name for this location (e.g., "Home", "Joe's Bar", etc.)
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Location Name"
                  fullWidth
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  disabled={editLocationLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'var(--border-color)' },
                      '&:hover fieldset': { borderColor: 'var(--beer-amber)' },
                      '&.Mui-focused fieldset': { borderColor: 'var(--beer-amber)' },
                    }
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setEditLocationOpen(false)}
                  disabled={editLocationLoading}
                  sx={{ color: 'var(--text-secondary)' }}
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveLocation}
                  disabled={editLocationLoading || !customLocation.trim()}
                  sx={{ 
                    color: 'var(--beer-amber)',
                    '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.3)' }
                  }}
                  startIcon={editLocationLoading ? <CircularProgress size={20} /> : <CheckIcon />}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Container>
    </Box>
  );
} 