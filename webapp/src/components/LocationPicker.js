import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  MyLocation as CurrentLocationIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

export default function LocationPicker({ onLocationSelect, selectedLocation }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showRecentLocations, setShowRecentLocations] = useState(true);
  const [recentLocations, setRecentLocations] = useState([]);

  useEffect(() => {
    // Load recent locations from localStorage
    const loadRecentLocations = () => {
      try {
        const saved = localStorage.getItem('recentLocations');
        if (saved) {
          setRecentLocations(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to load recent locations:', err);
      }
    };

    loadRecentLocations();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setLocations([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add your location search logic here
      // This is a placeholder that returns mock data
      const mockLocations = [
        { id: 1, name: 'The Local Pub', address: '123 Main St' },
        { id: 2, name: 'Craft Beer Bar', address: '456 Oak Ave' },
        { id: 3, name: 'Brewery Taproom', address: '789 Pine Rd' },
      ];
      
      setLocations(mockLocations);
    } catch (err) {
      setError('Failed to search locations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Add your reverse geocoding logic here
          const location = {
            id: 'current',
            name: 'Current Location',
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: { latitude, longitude },
          };
          setCurrentLocation(location);
          onLocationSelect(location);
        } catch (err) {
          setError('Failed to get location details');
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Failed to get your location');
        console.error(err);
        setLoading(false);
      }
    );
  };

  const handleSelectLocation = (location) => {
    onLocationSelect(location);
    
    // Update recent locations
    const updatedRecent = [
      location,
      ...recentLocations.filter(loc => loc.id !== location.id)
    ].slice(0, 5);
    
    setRecentLocations(updatedRecent);
    try {
      localStorage.setItem('recentLocations', JSON.stringify(updatedRecent));
    } catch (err) {
      console.error('Failed to save recent locations:', err);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex',
        gap: 1,
        mb: 2
      }}>
        <TextField
          fullWidth
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a location..."
          variant="outlined"
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <IconButton
          onClick={handleGetCurrentLocation}
          color="primary"
          sx={{
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <CurrentLocationIcon />
        </IconButton>
      </Box>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {locations.length > 0 && (
        <Paper 
          elevation={2}
          sx={{ 
            mb: 2,
            maxHeight: isMobile ? '40vh' : '300px',
            overflow: 'auto'
          }}
        >
          <List dense={isMobile}>
            {locations.map((location) => (
              <ListItem
                key={location.id}
                button
                onClick={() => handleSelectLocation(location)}
                selected={selectedLocation?.id === location.id}
              >
                <ListItemIcon>
                  <LocationIcon color={selectedLocation?.id === location.id ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText
                  primary={location.name}
                  secondary={location.address}
                  primaryTypographyProps={{
                    variant: isMobile ? 'body2' : 'body1',
                  }}
                  secondaryTypographyProps={{
                    variant: isMobile ? 'caption' : 'body2',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {recentLocations.length > 0 && !searchQuery && (
        <Paper elevation={1}>
          <ListItem
            button
            onClick={() => setShowRecentLocations(!showRecentLocations)}
          >
            <ListItemText
              primary="Recent Locations"
              primaryTypographyProps={{
                variant: isMobile ? 'body2' : 'body1',
                color: 'text.secondary',
              }}
            />
            {showRecentLocations ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>
          <Collapse in={showRecentLocations}>
            <List dense={isMobile}>
              {recentLocations.map((location) => (
                <ListItem
                  key={location.id}
                  button
                  onClick={() => handleSelectLocation(location)}
                  selected={selectedLocation?.id === location.id}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <LocationIcon color={selectedLocation?.id === location.id ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={location.name}
                    secondary={location.address}
                    primaryTypographyProps={{
                      variant: isMobile ? 'body2' : 'body1',
                    }}
                    secondaryTypographyProps={{
                      variant: isMobile ? 'caption' : 'body2',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Paper>
      )}
    </Box>
  );
} 