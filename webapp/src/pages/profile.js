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
  Snackbar,
  Collapse,
} from '@mui/material';
import {
  Edit as EditIcon,
  LocalBar as BeerIcon,
  People as FriendsIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Public as GlobeIcon,
  LocationCity as CityIcon,
  Apartment as StateIcon,
  ArrowBack,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, deleteDoc, updateDoc } from 'firebase/firestore';
import DrinkGraph from '../components/DrinkGraph';
import { exportService } from '../services/exportService';
import LocationEdit from '../components/LocationEdit';

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
  const [sectionLoading, setSectionLoading] = useState({
    profile: true,
    stats: true,
    recent: true,
    calendar: true
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [locationStats, setLocationStats] = useState({
    cities: new Set(),
    states: new Set(),
    countries: new Set(),
  });
  const [showLocationDetails, setShowLocationDetails] = useState(false);

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
    setSectionLoading(prev => ({ ...prev, profile: true }));
    try {
      const userDocRef = doc(db, 'users', targetUserId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        setError('User profile not found.');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    } finally {
      setSectionLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const fetchRecentDrinks = async () => {
    setSectionLoading(prev => ({ ...prev, recent: true }));
    try {
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', targetUserId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(drinksQuery);
      const drinks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setRecentDrinks(drinks);
    } catch (error) {
      console.error('Error fetching recent drinks:', error);
      throw error;
    } finally {
      setSectionLoading(prev => ({ ...prev, recent: false }));
    }
  };

  const fetchAllDrinks = async () => {
    setSectionLoading(prev => ({ ...prev, calendar: true }));
    try {
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', targetUserId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(drinksQuery);
      const drinks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setAllDrinks(drinks);
    } catch (error) {
      console.error('Error fetching all drinks:', error);
      setError('Failed to load drink history. Please try again later.');
    } finally {
      setSectionLoading(prev => ({ ...prev, calendar: false }));
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
      setRecentDrinks(prev => prev.filter(d => d.id !== drinkToDelete.id));
      setAllDrinks(prev => prev.filter(d => d.id !== drinkToDelete.id));
      setSuccessMessage('Drink deleted successfully');
      setShowSuccess(true);
      
      // Refresh stats after deletion
      await fetchUserStats();
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
    setSectionLoading(prev => ({ ...prev, stats: true }));
    try {
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', targetUserId)
      );
      const snapshot = await getDocs(drinksQuery);
      const drinks = snapshot.docs.map(doc => doc.data());

      // Calculate basic stats
      const totalDrinks = drinks.length;
      const uniqueBeers = new Set(drinks.map(d => d.brand)).size;
      const totalOunces = drinks.reduce((sum, d) => sum + (d.amount || 0), 0);

      // Find favorite beer
      const beerCounts = drinks.reduce((acc, d) => {
        acc[d.brand] = (acc[d.brand] || 0) + 1;
        return acc;
      }, {});
      const favoriteBeer = Object.entries(beerCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0];

      // Calculate location stats
      const cities = new Set();
      const states = new Set();
      const countries = new Set();

      drinks.forEach(drink => {
        if (drink.placeInfo) {
          if (drink.placeInfo.city) cities.add(drink.placeInfo.city);
          if (drink.placeInfo.state) states.add(drink.placeInfo.state);
          if (drink.placeInfo.country) countries.add(drink.placeInfo.country);
        }
      });

      setLocationStats({
        cities: Array.from(cities).sort(),
        states: Array.from(states).sort(),
        countries: Array.from(countries).sort(),
      });

      setStats({
        totalDrinks,
        uniqueBeers,
        favoriteBeer,
        totalOunces,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    } finally {
      setSectionLoading(prev => ({ ...prev, stats: false }));
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
    setSuccessMessage(`Successfully exported data to ${format.toUpperCase()}`);
    setShowSuccess(true);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'var(--background)'
      }}>
        <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchUserData}>
              Retry
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      {router.query.userId && (
        <Button
          onClick={() => router.push('/friends')}
          startIcon={<ArrowBack />}
          sx={{
            mb: 2,
            color: 'var(--beer-amber)',
            '&:hover': { bgcolor: 'rgba(244, 164, 96, 0.1)' }
          }}
        >
          Back to Friends
        </Button>
      )}

      {/* Profile Section */}
      <Card sx={{ 
        mb: 4, 
        position: 'relative',
        bgcolor: 'var(--beer-dark)',
        border: '1px solid var(--beer-amber)'
      }}>
        {sectionLoading.profile && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            bgcolor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}>
            <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
          </Box>
        )}
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

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { key: 'totalDrinks', label: 'Total Drinks' },
          { key: 'uniqueBeers', label: 'Unique Beers' },
          { key: 'totalOunces', label: 'Total Ounces' },
          { key: 'favoriteBeer', label: 'Favorite Beer', value: stats.favoriteBeer || 'None yet' }
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.key}>
            <Card sx={{ 
              position: 'relative',
              bgcolor: 'var(--beer-dark)',
              border: '1px solid var(--beer-amber)'
            }}>
              {sectionLoading.stats && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  bgcolor: 'rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <CircularProgress size={24} sx={{ color: 'var(--beer-amber)' }} />
                </Box>
              )}
              <Box className="stat-card">
                <BeerIcon sx={{ fontSize: 40, color: 'var(--beer-amber)', mb: 1 }} />
                <Typography className="stat-value">
                  {stat.value !== undefined ? stat.value : stats[stat.key]}
                </Typography>
                <Typography className="stat-label">{stat.label}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Location Stats Section */}
      <Card sx={{ mb: 4, position: 'relative' }}>
        {sectionLoading.stats && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            bgcolor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}>
            <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
          </Box>
        )}
        <Box className="premium-card" sx={{ p: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: showLocationDetails ? 2 : 0 
          }}>
            <Typography variant="h6" color="var(--beer-amber)">
              Location Stats
            </Typography>
            <IconButton
              onClick={() => setShowLocationDetails(!showLocationDetails)}
              sx={{ 
                transform: showLocationDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
                color: 'var(--beer-amber)'
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>

          <Grid container spacing={3} sx={{ mb: showLocationDetails ? 3 : 0 }}>
            {[
              { key: 'cities', label: 'Cities', icon: CityIcon, count: locationStats.cities.length },
              { key: 'states', label: 'States', icon: StateIcon, count: locationStats.states.length },
              { key: 'countries', label: 'Countries', icon: GlobeIcon, count: locationStats.countries.length }
            ].map((stat) => (
              <Grid item xs={12} sm={4} key={stat.key}>
                <Card 
                  sx={{ 
                    p: 2,
                    bgcolor: 'var(--background-light)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <stat.icon sx={{ fontSize: 40, color: 'var(--beer-amber)' }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                      {stat.count}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Collapse in={showLocationDetails}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" color="var(--beer-amber)" gutterBottom>
                  Cities
                </Typography>
                <List dense>
                  {locationStats.cities.map((city) => (
                    <ListItem key={city}>
                      <ListItemText 
                        primary={city}
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            color: 'var(--text-primary)'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" color="var(--beer-amber)" gutterBottom>
                  States
                </Typography>
                <List dense>
                  {locationStats.states.map((state) => (
                    <ListItem key={state}>
                      <ListItemText 
                        primary={state}
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            color: 'var(--text-primary)'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" color="var(--beer-amber)" gutterBottom>
                  Countries
                </Typography>
                <List dense>
                  {locationStats.countries.map((country) => (
                    <ListItem key={country}>
                      <ListItemText 
                        primary={country}
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            color: 'var(--text-primary)'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Collapse>
        </Box>
      </Card>

      {/* Drink Analytics Section */}
      <Card sx={{ 
        mb: 4, 
        position: 'relative',
        bgcolor: 'var(--beer-dark)',
        border: '1px solid var(--beer-amber)'
      }}>
        {sectionLoading.calendar && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            bgcolor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}>
            <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
          </Box>
        )}
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="var(--beer-amber)">
              Drink Analytics
            </Typography>
          </Box>
          <DrinkGraph drinks={recentDrinks} />
        </Box>
      </Card>

      {/* Recent Activity Section */}
      <Card sx={{ 
        mb: 4, 
        position: 'relative',
        bgcolor: 'var(--beer-dark)',
        border: '1px solid var(--beer-amber)'
      }}>
        {sectionLoading.recent && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            bgcolor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}>
            <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
          </Box>
        )}
        <Box sx={{ p: 4 }}>
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
                            {isOwnProfile ? (
                              <LocationEdit 
                                placeInfo={drink.placeInfo} 
                                onLocationUpdated={() => {
                                  fetchRecentDrinks();
                                  fetchAllDrinks();
                                }}
                              />
                            ) : (
                              <Typography variant="body2" color="var(--text-secondary)">
                                {drink.placeInfo.neighborhood ? 
                                  `${drink.placeInfo.neighborhood}, ${drink.placeInfo.city}` : 
                                  drink.placeInfo.address || 'Unknown Location'}
                              </Typography>
                            )}
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
      </Card>

      {/* Export Section */}
      {isOwnProfile && (
        <Card sx={{ 
          mb: 4, 
          position: 'relative',
          bgcolor: 'var(--beer-dark)',
          border: '1px solid var(--beer-amber)'
        }}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" color="var(--beer-amber)" gutterBottom>
              Export Drink History
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => handleExport('excel')}
                sx={{ bgcolor: 'var(--beer-amber)', '&:hover': { bgcolor: 'var(--beer-amber-dark)' } }}
                startIcon={<FileDownloadIcon />}
              >
                Export to Excel
              </Button>
              <Button
                variant="contained"
                onClick={() => handleExport('csv')}
                sx={{ bgcolor: 'var(--beer-amber)', '&:hover': { bgcolor: 'var(--beer-amber-dark)' } }}
                startIcon={<FileDownloadIcon />}
              >
                Export to CSV
              </Button>
              <Button
                variant="contained"
                onClick={() => handleExport('json')}
                sx={{ bgcolor: 'var(--beer-amber)', '&:hover': { bgcolor: 'var(--beer-amber-dark)' } }}
                startIcon={<FileDownloadIcon />}
              >
                Export to JSON
              </Button>
            </Box>
          </Box>
        </Card>
      )}

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
        <DialogTitle>Delete Drink?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'var(--text-secondary)' }}>
            Are you sure you want to delete this drink? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteDrink}
            disabled={deleteLoading}
            color="error"
          >
            {deleteLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Deleting...
              </>
            ) : (
              'Delete'
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
    </Container>
  );
} 