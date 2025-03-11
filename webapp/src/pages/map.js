import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Card,
  Slider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '../context/AuthContext';
import { drinkService } from '../services/drinkService';
import { friendService } from '../services/friendService';
import { exportService } from '../services/exportService';
import { locationService } from '../services/locationService';
import {
  LocalBar as DrinkIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  FilterAlt as FilterIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import dynamic from 'next/dynamic';

// Dynamically import the Map component with no SSR
const MapWithNoSSR = dynamic(
  () => import('../components/MapComponent'),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: 600, 
        bgcolor: '#121212'
      }}>
        <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
      </Box>
    ) 
  }
);

const containerTypes = [
  'can',
  'bottle',
  'solo cup',
  'shotgun',
  'funnel',
  'pint glass',
  'martini glass',
  'wine glass',
  'other',
];

// Custom styled components
const MapControls = styled(Card)(({ theme }) => ({
  position: 'absolute',
  top: 100,
  right: 20,
  zIndex: 1,
  padding: theme.spacing(3),
  width: 300,
  background: 'var(--glass-background)',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--glass-border)',
}));

const TimeSlider = styled(Slider)({
  color: 'var(--beer-amber)',
  '& .MuiSlider-thumb': {
    backgroundColor: 'var(--beer-amber)',
  },
  '& .MuiSlider-track': {
    backgroundColor: 'var(--beer-amber)',
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'var(--glass-border)',
  },
});

// Bubble component for background effects
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

export default function MapView() {
  const { user } = useAuth();
  const [drinks, setDrinks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendDrinks, setFriendDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showFriendDrinks, setShowFriendDrinks] = useState(true);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [cursorCoords, setCursorCoords] = useState(null);
  const [filters, setFilters] = useState({
    drinkType: 'all',
    container: '',
    brand: '',
    rating: '',
    startDate: null,
    endDate: null,
  });
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [selectedLocationDrink, setSelectedLocationDrink] = useState(null);
  const [customLocation, setCustomLocation] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [markerSizeByTimeOfDay, setMarkerSizeByTimeOfDay] = useState(false);

  // Generate random bubbles
  const bubbles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 20 + 10,
    left: Math.random() * 100,
    delay: Math.random() * 2
  }));

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchDrinks(),
          fetchFriends()
        ]);
        
        // Explicitly set loading to false after data is loaded
        console.log("Map data loaded successfully");
      } catch (error) {
        console.error("Error loading map data:", error);
        setAlertInfo({
          open: true,
          message: "Error loading map data. Please try again.",
          severity: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const fetchDrinks = async () => {
    try {
      const drinkQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', user.uid)
      );
      const drinkSnapshot = await getDocs(drinkQuery);
      const drinkData = drinkSnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert timestamp to Date object
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : null;
        return {
          id: doc.id,
          ...data,
          timestamp
        };
      });

      console.log(`Fetched ${drinkData.length} drinks`);
      setDrinks(drinkData);
      return drinkData;
    } catch (error) {
      console.error('Error fetching drinks:', error);
      throw error;
    }
  };

  const fetchFriends = async () => {
    try {
      // Get all drinks from users who are currently friends
      const friendsSnapshot = await getDocs(collection(db, 'users'));
      const allUsers = friendsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter out the current user
      const otherUsers = allUsers.filter(user => user.id !== user.uid);
      
      // Fetch drinks for all users except current user
      if (otherUsers.length > 0 && showFriendDrinks) {
        const friendDrinksPromises = otherUsers.map(async (friend) => {
          const q = query(collection(db, 'drinks'), where('userId', '==', friend.id));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(), 
            friendId: friend.id,
            friendUsername: friend.username || friend.displayName || 'Anonymous Beer Lover'
          }));
        });
        
        const allFriendDrinks = await Promise.all(friendDrinksPromises);
        setFriendDrinks(allFriendDrinks.flat());
      } else {
        setFriendDrinks([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      drinkType: 'all',
      container: '',
      brand: '',
      rating: '',
      startDate: null,
      endDate: null,
    });
  };

  const handleMouseMove = (event) => {
    if (event.lngLat) {
      setCursorCoords({
        lng: event.lngLat.lng.toFixed(4),
        lat: event.lngLat.lat.toFixed(4)
      });
    }
  };

  const getMarkerSize = (zoom) => {
    return Math.max(15, Math.min(40, zoom * 2));
  };

  const handleExport = (format) => {
    const data = [...drinks, ...friendDrinks];
    
    if (format === 'csv') {
      exportService.exportToCsv(data);
    } else if (format === 'json') {
      exportService.exportToJson(data);
    }
  };

  const getMarkerColor = (drink) => {
    // Get color based on drink type
    switch (drink.drinkType?.toLowerCase()) {
      case 'lager':
        return '#F9A825'; // Amber
      case 'ale':
        return '#D84315'; // Copper
      case 'ipa':
        return '#EF6C00'; // Orange
      case 'stout':
        return '#3E2723'; // Dark brown
      case 'porter':
        return '#4E342E'; // Brown
      case 'wheat':
        return '#FFD54F'; // Light gold
      default:
        return '#FBC02D'; // Default amber
    }
  };

  // Handle edit location from map popup
  const handleEditLocation = (drink) => {
    setSelectedLocationDrink(drink);
    setCustomLocation(drink.placeInfo?.customName || drink.placeInfo?.placeName || '');
    setLocationDialogOpen(true);
  };

  // Save custom location name
  const handleSaveLocation = async () => {
    if (!selectedLocationDrink || !customLocation.trim()) return;
    
    setIsEditingLocation(true);
    try {
      // Get existing place info or create new object
      const placeInfo = selectedLocationDrink.placeInfo || {};
      
      // Update with custom name
      const updatedPlaceInfo = {
        ...placeInfo,
        customName: customLocation,
        isCustom: true
      };
      
      // Update in Firestore
      await locationService.updateDrinkLocation(selectedLocationDrink.id, updatedPlaceInfo);
      
      // Update local state
      setDrinks(prevDrinks => prevDrinks.map(drink => {
        if (drink.id === selectedLocationDrink.id) {
          return {
            ...drink,
            placeInfo: updatedPlaceInfo
          };
        }
        return drink;
      }));
      
      // Show success alert
      setAlertInfo({ 
        open: true, 
        message: 'Location updated successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error updating location:', error);
      setAlertInfo({ 
        open: true, 
        message: 'Failed to update location.', 
        severity: 'error' 
      });
    } finally {
      setIsEditingLocation(false);
      setLocationDialogOpen(false);
      setSelectedLocationDrink(null);
    }
  };

  const handleMarkerHover = (event) => {
    if (event.lngLat) {
      setTooltipContent(event.lngLat.lng.toFixed(4) + ', ' + event.lngLat.lat.toFixed(4));
      setTooltipPosition({ x: event.lngLat.lng, y: event.lngLat.lat });
    }
  };

  const getMarkerSizeByTimeOfDay = (drink) => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) {
      return getMarkerSize(24); // Morning
    } else if (currentHour >= 12 && currentHour < 18) {
      return getMarkerSize(24); // Afternoon
    } else {
      return getMarkerSize(24); // Evening
    }
  };

  // Calculate filtered drinks based on current filters
  const filteredDrinks = drinks.filter(drink => {
    // Filter by drink type
    if (filters.drinkType !== 'all' && drink.drinkType !== filters.drinkType) {
      return false;
    }
    
    // Filter by container type
    if (filters.container && drink.containerType !== filters.container) {
      return false;
    }

    // Filter by brand
    if (filters.brand && !drink.brand?.toLowerCase().includes(filters.brand.toLowerCase())) {
      return false;
    }

    // Filter by rating
    if (filters.rating && drink.rating < parseInt(filters.rating)) {
      return false;
    }
    
    // Filter by date range
    if (filters.startDate && drink.timestamp && new Date(drink.timestamp) < filters.startDate) {
      return false;
    }
    
    if (filters.endDate && drink.timestamp && new Date(drink.timestamp) > filters.endDate) {
      return false;
    }
    
    return true;
  });
  
  const filteredFriendDrinks = showFriendDrinks ? friendDrinks.filter(drink => {
    // Apply same filters as above
    if (filters.drinkType !== 'all' && drink.drinkType !== filters.drinkType) {
      return false;
    }
    
    if (filters.container && drink.containerType !== filters.container) {
      return false;
    }

    if (filters.brand && !drink.brand?.toLowerCase().includes(filters.brand.toLowerCase())) {
      return false;
    }

    if (filters.rating && drink.rating < parseInt(filters.rating)) {
      return false;
    }
    
    if (filters.startDate && drink.timestamp && new Date(drink.timestamp) < filters.startDate) {
      return false;
    }
    
    if (filters.endDate && drink.timestamp && new Date(drink.timestamp) > filters.endDate) {
      return false;
    }
    
    return true;
  }) : [];

  return (
    <Container 
      maxWidth={false} 
      disableGutters 
      sx={{ 
        height: 'calc(100vh - 64px)',
        mt: '64px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {bubbles.map(bubble => (
        <Bubble key={bubble.id} {...bubble} />
      ))}
      
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%', 
          bgcolor: '#121212'
        }}>
          <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
        </Box>
      ) : (
        <Box sx={{ 
          height: '100%', 
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <MapWithNoSSR 
            drinks={filteredDrinks}
            friendDrinks={filteredFriendDrinks}
            selectedDrink={selectedDrink}
            setSelectedDrink={setSelectedDrink}
            handleMouseMove={handleMarkerHover}
            getMarkerSize={(drink) => markerSizeByTimeOfDay ? getMarkerSizeByTimeOfDay(drink) : 24}
            getMarkerColor={(drink, type) => type === 'friend' ? 'var(--friend-marker)' : 'var(--beer-amber)'}
            onEditLocation={handleEditLocation}
          />
          
          {cursorCoords && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 1,
                fontSize: '0.875rem',
                zIndex: 10,
              }}
            >
              {cursorCoords.lat}, {cursorCoords.lng}
            </Box>
          )}

          {tooltipContent && (
            <Box
              sx={{
                position: 'absolute',
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y + 10,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: 1,
                borderRadius: 1,
                fontSize: '0.8rem',
                pointerEvents: 'none',
                zIndex: 1000,
                maxWidth: 200,
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                {tooltipContent}
              </Typography>
            </Box>
          )}

          <MapControls>
            <Typography variant="h6" gutterBottom>Map Controls</Typography>
            
            {/* Date Range Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="var(--text-secondary)">
                Date Range
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(newValue) => handleFilterChange('startDate', newValue)}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                  <DatePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={(newValue) => handleFilterChange('endDate', newValue)}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </Box>
              </LocalizationProvider>
            </Box>

            {/* Container Type Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="var(--text-secondary)">
                Container Type
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filters.container}
                  onChange={(e) => handleFilterChange('container', e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">All Containers</MenuItem>
                  {containerTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Brand Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="var(--text-secondary)">
                Brand
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by brand"
                value={filters.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
              />
            </Box>
            
            {/* Drink Type Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="var(--text-secondary)">
                Drink Type
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filters.drinkType}
                  onChange={(e) => handleFilterChange('drinkType', e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="lager">Lager</MenuItem>
                  <MenuItem value="ale">Ale</MenuItem>
                  <MenuItem value="ipa">IPA</MenuItem>
                  <MenuItem value="stout">Stout</MenuItem>
                  <MenuItem value="porter">Porter</MenuItem>
                  <MenuItem value="wheat">Wheat</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Rating Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="var(--text-secondary)">
                Minimum Rating
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">Any Rating</MenuItem>
                  <MenuItem value="5">5 Stars</MenuItem>
                  <MenuItem value="4">4+ Stars</MenuItem>
                  <MenuItem value="3">3+ Stars</MenuItem>
                  <MenuItem value="2">2+ Stars</MenuItem>
                  <MenuItem value="1">1+ Star</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Friends Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="var(--text-secondary)">
                Show Friends' Drinks
              </Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={showFriendDrinks}
                    onChange={(e) => setShowFriendDrinks(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'var(--beer-amber)',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'var(--beer-amber)',
                      },
                    }}
                  />
                }
                label="Show Friends"
              />
            </Box>

            {/* Map Legend */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="var(--text-secondary)">
                Map Legend
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#F9A825' }} />
                  <Typography variant="body2">Lager</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#D84315' }} />
                  <Typography variant="body2">Ale</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#EF6C00' }} />
                  <Typography variant="body2">IPA</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#3E2723' }} />
                  <Typography variant="body2">Stout</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#4E342E' }} />
                  <Typography variant="body2">Porter</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#FFD54F' }} />
                  <Typography variant="body2">Wheat</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#FBC02D' }} />
                  <Typography variant="body2">Other</Typography>
                </Box>
              </Box>
            </Box>

            <Button
              variant="outlined"
              onClick={clearFilters}
              fullWidth
              sx={{ 
                borderColor: 'var(--beer-amber)', 
                color: 'var(--beer-amber)',
                '&:hover': { borderColor: 'var(--copper)', background: 'rgba(255,255,255,0.03)' }
              }}
              startIcon={<FilterIcon />}
            >
              Clear Filters
            </Button>
          </MapControls>
        </Box>
      )}
      
      <Dialog
        open={locationDialogOpen}
        onClose={() => !isEditingLocation && setLocationDialogOpen(false)}
      >
        <DialogTitle>Edit Location Name</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter a descriptive name for this location (e.g., "Home", "Joe's Bar", etc.)
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Location Name"
            fullWidth
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            disabled={isEditingLocation}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setLocationDialogOpen(false)} 
            disabled={isEditingLocation}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveLocation} 
            disabled={isEditingLocation || !customLocation.trim()}
            sx={{ color: 'var(--beer-amber)' }}
          >
            {isEditingLocation ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={alertInfo.open}
        autoHideDuration={4000}
        onClose={() => setAlertInfo({ ...alertInfo, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlertInfo({ ...alertInfo, open: false })} 
          severity={alertInfo.severity}
          sx={{ width: '100%' }}
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 