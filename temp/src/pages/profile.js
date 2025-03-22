import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  LocalBar as BeerIcon,
  People as FriendsIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, deleteDoc, updateDoc } from 'firebase/firestore';
import DrinkGraph from '../components/DrinkGraph';
import { exportService } from '../services/exportService';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const { userId: profileUserId } = router.query;
  const [stats, setStats] = useState({
    totalDrinks: 0,
    uniqueBeers: 0,
    favoriteBeer: null,
    totalOunces: 0,
    friends: 0,
  });
  const [userData, setUserData] = useState(null);
  const [recentDrinks, setRecentDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [drinkToDelete, setDrinkToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [allDrinks, setAllDrinks] = useState([]);

  const isOwnProfile = !profileUserId || profileUserId === user?.uid;
  const targetUserId = profileUserId || user?.uid;

  useEffect(() => {
    if (targetUserId) {
      fetchUserData();
      fetchAllDrinks();
    }
  }, [targetUserId]);

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
        let timestamp;
        
        // Handle different timestamp formats
        if (data.timestamp) {
          if (typeof data.timestamp.toDate === 'function') {
            // Firestore Timestamp
            timestamp = data.timestamp.toDate();
          } else if (data.timestamp._seconds) {
            // Firestore Timestamp in seconds
            timestamp = new Date(data.timestamp._seconds * 1000);
          } else {
            // Regular date string or timestamp
            timestamp = new Date(data.timestamp);
          }
        } else {
          timestamp = new Date();
        }

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

  const fetchAllDrinks = async () => {
    try {
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', targetUserId)
      );
      const drinksSnapshot = await getDocs(drinksQuery);
      const drinks = drinksSnapshot.docs.map(doc => {
        const data = doc.data();
        let timestamp;
        
        // Handle different timestamp formats
        if (data.timestamp) {
          if (typeof data.timestamp.toDate === 'function') {
            // Firestore Timestamp
            timestamp = data.timestamp.toDate();
          } else if (data.timestamp._seconds) {
            // Firestore Timestamp in seconds
            timestamp = new Date(data.timestamp._seconds * 1000);
          } else {
            // Regular date string or timestamp
            timestamp = new Date(data.timestamp);
          }
        } else {
          timestamp = new Date();
        }

        return {
          id: doc.id,
          ...data,
          timestamp: timestamp.toISOString(), // Convert to ISO string for export compatibility
        };
      });
      setAllDrinks(drinks);
    } catch (error) {
      console.error('Error fetching all drinks:', error);
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
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', targetUserId)
      );
      const drinksSnapshot = await getDocs(drinksQuery);
      const drinks = drinksSnapshot.docs.map(doc => doc.data());

      const uniqueBrands = [...new Set(drinks.map(drink => drink.brand))];
      const brandCounts = drinks.reduce((acc, drink) => {
        acc[drink.brand] = (acc[drink.brand] || 0) + 1;
        return acc;
      }, {});

      const totalOunces = drinks.reduce((sum, drink) => sum + (drink.amount || 0), 0);
      
      const favoriteBeer = Object.entries(brandCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

      setStats({
        totalDrinks: drinks.length,
        uniqueBeers: uniqueBrands.length,
        favoriteBeer,
        totalOunces,
        friends: 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  const handleExport = (format) => {
    switch (format) {
      case 'excel':
        exportService.exportToExcel(allDrinks);
        break;
      case 'csv':
        exportService.exportToCsv(allDrinks);
        break;
      case 'json':
        exportService.exportToJson(allDrinks);
        break;
      default:
        console.error('Unsupported export format');
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
        <Card className="glass-card" sx={{ mb: 4, position: 'relative' }}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
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
            
            <Typography variant="h4" gutterBottom>
              {userData?.username || 'Anonymous Beer Lover'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Member since {formatDate(userData?.createdAt)}
            </Typography>
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
              <BeerIcon sx={{ fontSize: 40, color: 'var(--beer-amber)', mb: 1 }} />
              <Typography className="stat-value">{stats.totalOunces}</Typography>
              <Typography className="stat-label">Total Ounces</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box className="stat-card">
              <StarIcon sx={{ fontSize: 40, color: 'var(--beer-amber)', mb: 1 }} />
              <Typography className="stat-value">
                {stats.favoriteBeer || 'None'}
              </Typography>
              <Typography className="stat-label">Favorite Beer</Typography>
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

        {/* Recent Activity */}
        <Box className="premium-card" sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="var(--beer-amber)">
              Recent Activity
            </Typography>
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
                        {drink.placeInfo && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <LocationIcon sx={{ fontSize: '0.9rem', color: 'var(--text-secondary)', mr: 0.5 }} />
                            <Typography variant="body2" color="var(--text-secondary)">
                              {drink.placeInfo.placeName || 'Unknown Location'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      {isOwnProfile && (
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteDrink(drink)}
                          sx={{ color: 'var(--text-secondary)' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
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
          PaperProps={{
            sx: {
              bgcolor: 'var(--background)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }
          }}
        >
          <DialogTitle>
            Delete Beer Entry
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'var(--text-secondary)' }}>
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
              sx={{ color: 'rgb(211, 47, 47)' }}
              startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {isOwnProfile && (
          <Card className="glass-card" sx={{ mt: 4, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Export Drink History
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => handleExport('excel')}
                sx={{ bgcolor: 'var(--beer-amber)' }}
              >
                Export to Excel
              </Button>
              <Button
                variant="contained"
                onClick={() => handleExport('csv')}
                sx={{ bgcolor: 'var(--beer-amber)' }}
              >
                Export to CSV
              </Button>
              <Button
                variant="contained"
                onClick={() => handleExport('json')}
                sx={{ bgcolor: 'var(--beer-amber)' }}
              >
                Export to JSON
              </Button>
            </Box>
          </Card>
        )}
      </Container>
    </Box>
  );
} 