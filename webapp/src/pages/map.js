import { useState, useEffect, useRef, useMemo } from 'react';
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
  Alert,
  Collapse,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  LocalBar as DrinkIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  FilterAlt as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

// Dynamically import the MapWrapper component
const MapWrapper = dynamic(
  () => import('../components/MapWrapper'),
  { 
    ssr: false,
    loading: () => (
      <Box 
        sx={{ 
          width: '100%', 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'var(--background)'
        }}
      >
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
const FilterBar = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  backgroundColor: 'rgba(42, 39, 35, 0.95)',
  backdropFilter: 'blur(15px)',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  border: '2px solid rgba(251, 192, 45, 0.4)',
  marginBottom: theme.spacing(2),
  maxWidth: '800px',
  margin: '0 auto',
  color: 'var(--text-primary)',
  zIndex: 10,
}));

const FilterGrid = styled(Grid)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(1),
  },
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

const FilterToggleButton = styled(Button)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  justifyContent: 'center',
  padding: theme.spacing(1, 2),
  background: 'rgba(42, 39, 35, 0.95)',
  backdropFilter: 'blur(15px)',
  border: '2px solid rgba(251, 192, 45, 0.4)',
  borderRadius: '12px',
  color: 'var(--text-primary)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  '&:hover': {
    background: 'rgba(42, 39, 35, 0.98)',
    border: '2px solid rgba(251, 192, 45, 0.6)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
  },
}));

export default function MapPage() {
  console.log('🚨 MAP PAGE LOADED - NEW VERSION DEPLOYED! 🚨');
  console.log('If you see this message, the new code is running!');
  
  const { user } = useAuth();
  const [drinks, setDrinks] = useState([]);
  const [friendDrinks, setFriendDrinks] = useState([]);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerOptions, setContainerOptions] = useState([]);
  const [methodOptions, setMethodOptions] = useState([]);
  const [filters, setFilters] = useState({
    container: ['All Containers'],
    brand: ['All Brands'],
    rating: ['All Ratings'],
    startDate: null,
    endDate: null,
    method: ['All Methods']
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [markerSizeByTimeOfDay, setMarkerSizeByTimeOfDay] = useState(false);
  const [brandOptions, setBrandOptions] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [filteredBrandOptions, setFilteredBrandOptions] = useState([]);
  const [showFriendLogs, setShowFriendLogs] = useState(true);
  const [anchorEl, setAnchorEl] = useState({
    container: null,
    brand: null,
    method: null,
    rating: null
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchDrinks();
    }
  }, [user]);

  const fetchDrinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(drinksQuery);
      const drinksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setDrinks(drinksData);

      // Only fetch friend's drinks if the user has friends
      let friendsDrinks = [];
      if (user.friends && user.friends.length > 0) {
        const friendsQuery = query(
          collection(db, 'drinks'),
          where('userId', 'in', user.friends)
        );
        const friendsSnapshot = await getDocs(friendsQuery);
        friendsDrinks = friendsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
      }
      setFriendDrinks(friendsDrinks);

      // Combine user and friend drinks for filter options
      const allDrinks = [...drinksData, ...friendsDrinks];
      
      if (allDrinks.length > 0) {
        const uniqueBrands = [...new Set(allDrinks
          .map(drink => drink.brand)
          .filter(brand => brand && brand.trim() !== '')
        )].sort();
        setBrandOptions(uniqueBrands);
        setFilteredBrandOptions(uniqueBrands);

        const uniqueContainers = [...new Set(allDrinks
          .map(drink => drink.containerType)
          .filter(container => container && container.trim() !== '')
        )].sort();
        setContainerOptions(uniqueContainers);

        const uniqueMethods = [...new Set(allDrinks
          .map(drink => drink.method)
          .filter(method => method && method.trim() !== '')
        )].sort();
        setMethodOptions(uniqueMethods);
      }
    } catch (error) {
      console.error('Error fetching drinks:', error);
      setError('Failed to load drink locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Handle date fields differently
      if (field === 'startDate' || field === 'endDate') {
        newFilters[field] = value;
      }
      // Handle array fields
      else if (Array.isArray(value)) {
        newFilters[field] = value;
      }
      // Handle single value fields
      else {
        newFilters[field] = [value];
      }
      
      return newFilters;
    });
  };

  const handleFilterClick = (event, filterType) => {
    setAnchorEl(prev => ({
      ...prev,
      [filterType]: event.currentTarget
    }));
  };

  const handleFilterClose = (filterType) => {
    setAnchorEl(prev => ({
      ...prev,
      [filterType]: null
    }));
  };

  const clearFilters = () => {
    setShowClearConfirm(true);
  };

  const confirmClearFilters = () => {
    setShowClearConfirm(false);
    setSuccessMessage('Filters cleared successfully');
    setShowSuccess(true);
    setFilters({
      container: ['All Containers'],
      brand: ['All Brands'],
      rating: ['All Ratings'],
      startDate: null,
      endDate: null,
      method: ['All Methods']
    });
    fetchDrinks();
  };

  const handleMouseMove = (event) => {
    // Handle mouse move events if needed
  };

  const getMarkerSize = (zoom) => {
    return Math.max(20, Math.min(40, zoom * 2));
  };

  const getMarkerColor = (drink, type = 'user') => {
    if (type === 'friend') {
      return '#4CAF50'; // Green for friends
    }
    return '#FBC02D'; // Amber for user
  };

  const handleBrandSearch = (value) => {
    setBrandSearch(value);
    if (!value) {
      setFilteredBrandOptions(brandOptions);
      return;
    }
    const filtered = brandOptions.filter(brand =>
      brand.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBrandOptions(filtered);
  };

  // Calculate active filters count
  const calculateActiveFilters = useMemo(() => {
    let count = 0;
    
    // Count non-default filter selections
    if (!filters.container.includes('All Containers') || filters.container.length > 1) count++;
    if (!filters.brand.includes('All Brands') || filters.brand.length > 1) count++;
    if (!filters.rating.includes('All Ratings') || filters.rating.length > 1) count++;
    if (!filters.method.includes('All Methods') || filters.method.length > 1) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    
    console.log('🔍 Active filters count:', count, 'Filters:', filters);
    return count;
  }, [filters]);

  // Update active filters count
  useEffect(() => {
    setActiveFilters(calculateActiveFilters);
  }, [calculateActiveFilters]);

  // Memoize filtered results
  const filteredDrinks = useMemo(() => {
    const filterSet = {
      container: new Set(filters.container),
      brand: new Set(filters.brand),
      rating: new Set(filters.rating),
      method: new Set(filters.method)
    };

    const filtered = drinks.filter(drink => {
      // Helper function to check if a drink matches the filter
      const matchesFilter = (filterValues, drinkValue, allValue) => {
        // If "All" is selected, always include
        if (filterValues.has(allValue)) return true;
        
        // If no specific values selected, don't include
        if (filterValues.size === 0) return false;
        
        // Handle null/undefined drink values
        if (drinkValue === null || drinkValue === undefined || drinkValue === '') {
          return false;
        }
        
        // Check if drink value matches any selected filter values
        return filterValues.has(drinkValue);
      };

      // Check each filter
      const matchesContainer = matchesFilter(filterSet.container, drink.containerType, 'All Containers');
      const matchesBrand = matchesFilter(filterSet.brand, drink.brand, 'All Brands');
      const matchesMethod = matchesFilter(filterSet.method, drink.method, 'All Methods');
      
      // Special handling for rating (convert to string for comparison)
      const matchesRating = matchesFilter(
        new Set(filters.rating.map(r => r.toString())), 
        drink.rating?.toString(), 
        'All Ratings'
      );

      // Date filtering
      const drinkDate = drink.timestamp instanceof Date ? drink.timestamp : new Date(drink.timestamp);
      const matchesStartDate = !filters.startDate || drinkDate >= filters.startDate;
      const matchesEndDate = !filters.endDate || drinkDate <= filters.endDate;

      return matchesContainer && matchesBrand && matchesRating && matchesMethod && matchesStartDate && matchesEndDate;
    });

    console.log('🍺 User drinks filtered:', filtered.length, 'of', drinks.length, 'total');
    return filtered;
  }, [drinks, filters]);

  const filteredFriendDrinks = useMemo(() => {
    if (!showFriendLogs) return [];
    
    const filterSet = {
      container: new Set(filters.container),
      brand: new Set(filters.brand),
      rating: new Set(filters.rating),
      method: new Set(filters.method)
    };

    const filtered = friendDrinks.filter(drink => {
      // Helper function to check if a drink matches the filter
      const matchesFilter = (filterValues, drinkValue, allValue) => {
        // If "All" is selected, always include
        if (filterValues.has(allValue)) return true;
        
        // If no specific values selected, don't include
        if (filterValues.size === 0) return false;
        
        // Handle null/undefined drink values
        if (drinkValue === null || drinkValue === undefined || drinkValue === '') {
          return false;
        }
        
        // Check if drink value matches any selected filter values
        return filterValues.has(drinkValue);
      };

      // Check each filter
      const matchesContainer = matchesFilter(filterSet.container, drink.containerType, 'All Containers');
      const matchesBrand = matchesFilter(filterSet.brand, drink.brand, 'All Brands');
      const matchesMethod = matchesFilter(filterSet.method, drink.method, 'All Methods');
      
      // Special handling for rating (convert to string for comparison)
      const matchesRating = matchesFilter(
        new Set(filters.rating.map(r => r.toString())), 
        drink.rating?.toString(), 
        'All Ratings'
      );

      // Date filtering (consistent with user drinks)
      const drinkDate = drink.timestamp instanceof Date ? drink.timestamp : new Date(drink.timestamp);
      const matchesStartDate = !filters.startDate || drinkDate >= filters.startDate;
      const matchesEndDate = !filters.endDate || drinkDate <= filters.endDate;

      return matchesContainer && matchesBrand && matchesRating && matchesMethod && matchesStartDate && matchesEndDate;
    });

    console.log('👥 Friend drinks filtered:', filtered.length, 'of', friendDrinks.length, 'total');
    return filtered;
  }, [friendDrinks, filters, showFriendLogs]);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
          bgcolor: '#121212'
        }}>
          <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
          bgcolor: '#121212',
          color: 'var(--text-primary)',
          flexDirection: 'column',
          gap: 2,
          p: 3,
        }}>
          <Typography variant="h6" align="center">{error}</Typography>
          <Typography variant="body2" align="center" color="var(--text-secondary)">
            Please try refreshing the page or contact support if the problem persists.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={fetchDrinks}
            sx={{
              borderColor: 'var(--glass-border)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--glass-background)',
              '&:hover': {
                borderColor: 'var(--beer-amber)',
                color: 'var(--beer-amber)',
                backgroundColor: 'var(--glass-background)',
              },
            }}
          >
            Retry
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <FilterToggleButton
            onClick={() => setShowFilters(!showFilters)}
            startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            endIcon={<FilterIcon />}
            sx={{
              maxWidth: '100%',
              margin: '0 auto',
              mb: showFilters ? 2 : 0
            }}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            aria-label="Toggle filter panel"
          >
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </FilterToggleButton>

          <Collapse in={showFilters} id="filter-panel" role="region" aria-label="Filter options">
            <FilterBar>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3, 
                gap: 2,
                borderBottom: '1px solid var(--glass-border)',
                pb: 2
              }}>
                <Typography variant="h6" sx={{ flex: 1 }}>Map Filters</Typography>
                {activeFilters > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                    sx={{ 
                      borderColor: 'var(--beer-amber)', 
                      color: 'var(--beer-amber)',
                      '&:hover': { 
                        borderColor: 'var(--copper)', 
                        background: 'rgba(255,255,255,0.03)' 
                      }
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </Box>

              <FilterGrid>
                <Grid item>
                  <FormControl fullWidth>
                    <InputLabel>Container</InputLabel>
                    <Select
                      multiple
                      value={filters.container}
                      onChange={(e) => handleFilterChange('container', e.target.value)}
                      label="Container"
                      renderValue={(selected) => selected.join(', ')}
                    >
                      <MenuItem value="All Containers">All Containers</MenuItem>
                      {containerOptions.map(container => (
                        <MenuItem key={container} value={container}>
                          {container.charAt(0).toUpperCase() + container.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item>
                  <FormControl fullWidth>
                    <InputLabel>Brand</InputLabel>
                    <Select
                      multiple
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      label="Brand"
                      renderValue={(selected) => selected.join(', ')}
                    >
                      <MenuItem value="All Brands">All Brands</MenuItem>
                      {brandOptions.map(brand => (
                        <MenuItem key={brand} value={brand}>
                          {brand}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item>
                  <FormControl fullWidth>
                    <InputLabel>Method</InputLabel>
                    <Select
                      multiple
                      value={filters.method}
                      onChange={(e) => handleFilterChange('method', e.target.value)}
                      label="Method"
                      renderValue={(selected) => selected.join(', ')}
                    >
                      <MenuItem value="All Methods">All Methods</MenuItem>
                      {methodOptions.map(method => (
                        <MenuItem key={method} value={method}>
                          {method}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item>
                  <FormControl fullWidth>
                    <InputLabel>Rating</InputLabel>
                    <Select
                      multiple
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      label="Rating"
                      renderValue={(selected) => selected.join(', ')}
                    >
                      <MenuItem value="All Ratings">All Ratings</MenuItem>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <MenuItem key={rating} value={rating}>
                          {rating} Stars
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={filters.startDate}
                      onChange={(date) => handleFilterChange('startDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={filters.endDate}
                      onChange={(date) => handleFilterChange('endDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showFriendLogs}
                        onChange={() => setShowFriendLogs(!showFriendLogs)}
                        sx={{
                          color: 'var(--beer-amber)',
                          '&.Mui-checked': {
                            color: 'var(--beer-amber)',
                          },
                        }}
                      />
                    }
                    label="Show Friend Logs"
                    sx={{
                      color: 'var(--text-primary)',
                      '& .MuiFormControlLabel-label': {
                        color: 'var(--text-primary)',
                      },
                    }}
                  />
                </Grid>
              </FilterGrid>
            </FilterBar>
          </Collapse>

          <Box 
            sx={{ 
              height: showFilters ? 'calc(100vh - 400px)' : 'calc(100vh - 200px)',
              width: '100%',
              position: 'relative',
              bgcolor: '#121212',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'height 0.3s ease'
            }}
            role="application"
            aria-label="Map showing drink locations"
          >
            <MapWrapper
              drinks={filteredDrinks}
              friendDrinks={filteredFriendDrinks}
              selectedDrink={selectedDrink}
              setSelectedDrink={setSelectedDrink}
              handleMouseMove={handleMouseMove}
              getMarkerSize={getMarkerSize}
              getMarkerColor={getMarkerColor}
              onError={(error) => {
                setError(error.message);
              }}
              onLocationUpdate={() => {
                setSuccessMessage('Location updated successfully');
                setShowSuccess(true);
                fetchDrinks();
              }}
            />
          </Box>
        </Box>
      </Container>

      {/* Clear Filters Confirmation Dialog */}
      <Dialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        PaperProps={{
          sx: {
            bgcolor: 'var(--background)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }
        }}
      >
        <DialogTitle>Clear Filters?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'var(--text-secondary)' }}>
            Are you sure you want to clear all filters? This will show all drinks on the map.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearConfirm(false)}>
            Cancel
          </Button>
          <Button onClick={confirmClearFilters} color="primary">
            Clear
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
    </Layout>
  );
} 