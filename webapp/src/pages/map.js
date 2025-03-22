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
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1,
  backgroundColor: 'var(--background)',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  border: '1px solid var(--border-color)',
  maxWidth: '300px',
  width: '90%',
}));

const FilterGrid = styled(Grid)(({ theme }) => ({
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
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
  justifyContent: 'flex-start',
  padding: theme.spacing(1, 2),
  background: 'var(--glass-background)',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '12px',
  color: 'var(--text-primary)',
  '&:hover': {
    background: 'var(--glass-background)',
    opacity: 0.9,
  },
}));

export default function MapPage() {
  const { user } = useAuth();
  const [drinks, setDrinks] = useState([]);
  const [friendDrinks, setFriendDrinks] = useState([]);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerOptions, setContainerOptions] = useState([]);
  const [methodOptions, setMethodOptions] = useState([]);
  const [filters, setFilters] = useState({
    drinkType: ['All Drink Types'],
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
    drinkType: null,
    container: null,
    brand: null,
    method: null,
    rating: null
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dateRange, setDateRange] = useState([0, 100]);
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
          ...doc.data()
        }));
      }
      setFriendDrinks(friendsDrinks);

      if (drinksData.length > 0) {
        const uniqueBrands = [...new Set(drinksData
          .map(drink => drink.brand)
          .filter(brand => brand && brand.trim() !== '')
        )].sort();
        setBrandOptions(uniqueBrands);
        setFilteredBrandOptions(uniqueBrands);

        const uniqueContainers = [...new Set(drinksData
          .map(drink => drink.containerType)
          .filter(container => container && container.trim() !== '')
        )].sort();
        setContainerOptions(uniqueContainers);

        const uniqueMethods = [...new Set(drinksData
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
      if (Array.isArray(value)) {
        newFilters[field] = value;
      } else {
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
    setDateRange([0, 100]);
    setShowClearConfirm(false);
    setSuccessMessage('Filters cleared successfully');
    setShowSuccess(true);
    setFilters({
      drinkType: ['All Drink Types'],
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

  const filteredDrinks = drinks.filter(drink => {
    return (
      (filters.drinkType.includes('All Drink Types') || filters.drinkType.includes(drink.type)) &&
      (filters.container.includes('All Containers') || filters.container.includes(drink.containerType)) &&
      (filters.brand.includes('All Brands') || filters.brand.includes(drink.brand)) &&
      (filters.rating.includes('All Ratings') || filters.rating.includes(drink.rating)) &&
      (filters.method.includes('All Methods') || filters.method.includes(drink.method)) &&
      (!filters.startDate || new Date(drink.timestamp.toDate()) >= filters.startDate) &&
      (!filters.endDate || new Date(drink.timestamp.toDate()) <= filters.endDate)
    );
  });

  const filteredFriendDrinks = friendDrinks.filter(drink => {
    if (filters.drinkType !== 'All Drink Types' && drink.type !== filters.drinkType) return false;
    if (filters.container && drink.container !== filters.container) return false;
    if (filters.brand && !drink.brand?.toLowerCase().includes(filters.brand.toLowerCase())) return false;
    if (filters.rating && drink.rating !== parseInt(filters.rating)) return false;
    if (filters.startDate && new Date(drink.timestamp) < filters.startDate) return false;
    if (filters.endDate && new Date(drink.timestamp) > filters.endDate) return false;
    return true;
  });

  const handleDateRangeChange = (event, newValue) => {
    setDateRange(newValue);
  };

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
          >
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </FilterToggleButton>

          <Collapse in={showFilters}>
            <FilterBar>
              <FilterGrid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Drink Type</InputLabel>
                    <Select
                      multiple
                      value={filters.drinkType}
                      onChange={(e) => handleFilterChange('drinkType', e.target.value)}
                      label="Drink Type"
                      renderValue={(selected) => selected.join(', ')}
                      onOpen={(e) => handleFilterClick(e, 'drinkType')}
                      onClose={() => handleFilterClose('drinkType')}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            width: 250,
                          },
                        },
                        anchorEl: anchorEl.drinkType,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                      }}
                    >
                      <MenuItem value="All Drink Types">All Drink Types</MenuItem>
                      <MenuItem value="beer">Beer</MenuItem>
                      <MenuItem value="wine">Wine</MenuItem>
                      <MenuItem value="spirits">Spirits</MenuItem>
                      <MenuItem value="cocktail">Cocktail</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Container</InputLabel>
                    <Select
                      multiple
                      value={filters.container}
                      onChange={(e) => handleFilterChange('container', e.target.value)}
                      label="Container"
                      renderValue={(selected) => selected.join(', ')}
                      onOpen={(e) => handleFilterClick(e, 'container')}
                      onClose={() => handleFilterClose('container')}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            width: 250,
                          },
                        },
                        anchorEl: anchorEl.container,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                      }}
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

                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Brand</InputLabel>
                    <Select
                      multiple
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      label="Brand"
                      renderValue={(selected) => selected.join(', ')}
                      onOpen={(e) => handleFilterClick(e, 'brand')}
                      onClose={() => handleFilterClose('brand')}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            width: 250,
                          },
                        },
                        anchorEl: anchorEl.brand,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                      }}
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

                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Method</InputLabel>
                    <Select
                      multiple
                      value={filters.method}
                      onChange={(e) => handleFilterChange('method', e.target.value)}
                      label="Method"
                      renderValue={(selected) => selected.join(', ')}
                      onOpen={(e) => handleFilterClick(e, 'method')}
                      onClose={() => handleFilterClose('method')}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            width: 250,
                          },
                        },
                        anchorEl: anchorEl.method,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                      }}
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

                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Rating</InputLabel>
                    <Select
                      multiple
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      label="Rating"
                      renderValue={(selected) => selected.join(', ')}
                      onOpen={(e) => handleFilterClick(e, 'rating')}
                      onClose={() => handleFilterClose('rating')}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            width: 250,
                          },
                        },
                        anchorEl: anchorEl.rating,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                      }}
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

                <Grid item xs={12} sm={6} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={filters.startDate}
                      onChange={(date) => handleFilterChange('startDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={filters.endDate}
                      onChange={(date) => handleFilterChange('endDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
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

                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 1,
                    mt: 2
                  }}>
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={clearFilters}
                      disabled={activeFilters === 0}
                      sx={{
                        borderColor: 'var(--glass-border)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--glass-background)',
                        '&:hover': {
                          borderColor: 'var(--beer-amber)',
                          color: 'var(--beer-amber)',
                          backgroundColor: 'var(--glass-background)',
                        },
                        '&.Mui-disabled': {
                          color: 'var(--text-secondary)',
                        },
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                </Grid>
              </FilterGrid>
            </FilterBar>
          </Collapse>

          <Box sx={{ 
            height: 'calc(100vh - 300px)',
            width: '100%',
            position: 'relative',
            bgcolor: '#121212',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <MapWrapper
              drinks={filteredDrinks}
              friendDrinks={showFriendLogs ? filteredFriendDrinks : []}
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