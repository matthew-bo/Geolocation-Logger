import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress
} from '@mui/material';
import { 
  LocalBar as DrinkIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon 
} from '@mui/icons-material';
import mapboxgl from 'mapbox-gl';
import { useRouter } from 'next/router';

// Dynamically import map components with no SSR
const Map = dynamic(
  () => import('react-map-gl').then(mod => mod.Map),
  { ssr: false }
);

const MapControls = dynamic(
  () => Promise.all([
    import('react-map-gl').then(mod => ({
      NavigationControl: mod.NavigationControl,
      ScaleControl: mod.ScaleControl,
      FullscreenControl: mod.FullscreenControl,
      GeolocateControl: mod.GeolocateControl,
      Marker: mod.Marker,
      Popup: mod.Popup
    }))
  ]).then(([controls]) => controls),
  { ssr: false }
);

// Replace this with your actual Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapComponent({ 
  drinks = [], 
  friendDrinks = [], 
  selectedDrink, 
  setSelectedDrink,
  handleMouseMove,
  getMarkerSize,
  getMarkerColor,
  onEditLocation
}) {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewport, setViewport] = useState({
    latitude: 40,
    longitude: -74.5,
    zoom: 9,
    bearing: 0,
    pitch: 0
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setMapError("Mapbox token not found. Please check your environment variables.");
      return;
    }

    // Initialize map when component mounts
    const initializeMap = async () => {
      try {
        // Ensure mapbox-gl is loaded
        await import('mapbox-gl/dist/mapbox-gl.css');
        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError("Error loading map components. Please try refreshing the page.");
      }
    };

    initializeMap();
  }, []);

  // Fit map to markers on load
  useEffect(() => {
    if (mapLoaded && mapRef.current && drinks.length > 0) {
      try {
        const bounds = new mapboxgl.LngLatBounds();
        let hasValidCoordinates = false;

        [...drinks, ...friendDrinks].forEach(drink => {
          if (drink.location && 
              drink.location.lat && 
              !isNaN(drink.location.lat) && 
              drink.location.lng && 
              !isNaN(drink.location.lng)) {
            bounds.extend([drink.location.lng, drink.location.lat]);
            hasValidCoordinates = true;
          }
        });

        if (hasValidCoordinates) {
          mapRef.current.fitBounds(bounds, {
            padding: {
              top: isMobile ? 180 : 200,
              bottom: 50,
              left: 50,
              right: 50
            },
            duration: 1000
          });
        }
      } catch (error) {
        console.error('Error setting map bounds:', error);
        setMapError("Error loading map. Please try refreshing the page.");
      }
    }
  }, [drinks, friendDrinks, isMobile, mapLoaded]);

  // Handle click on edit location button in popup
  const handleEditLocationClick = (drink, e) => {
    e.stopPropagation(); // Prevent closing the popup
    if (onEditLocation) {
      onEditLocation(drink);
    }
  };

  if (mapError) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#1A1A1A',
        color: 'var(--text-primary)',
        flexDirection: 'column',
        gap: 2,
        p: 3,
      }}>
        <Typography variant="h6" align="center">{mapError}</Typography>
        <Typography variant="body2" align="center" color="var(--text-secondary)">
          If the problem persists, please check your configuration or contact support.
        </Typography>
      </Box>
    );
  }

  if (!mapLoaded) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#1A1A1A'
      }}>
        <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
      </Box>
    );
  }

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        backgroundColor: '#1A1A1A'
      }}
    >
      <Map
        ref={mapRef}
        initialViewState={viewport}
        onMove={evt => setViewport(evt.viewState)}
        onMouseMove={handleMouseMove}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        minZoom={1}
        maxZoom={20}
        attributionControl={true}
        antialias={true}
        onError={(e) => {
          console.error('Map error:', e);
          setMapError("Error loading map. Please try refreshing the page.");
        }}
      >
        {mapLoaded && (
          <>
            <MapControls.GeolocateControl 
              position={isMobile ? "bottom-right" : "top-right"}
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation={true}
            />
            <MapControls.FullscreenControl position={isMobile ? "bottom-right" : "top-right"} />
            <MapControls.NavigationControl position={isMobile ? "bottom-right" : "top-right"} />
            <MapControls.ScaleControl position="bottom-right" />
            
            {drinks.map((drink) => (
              drink.location && 
              drink.location.lat && 
              !isNaN(drink.location.lat) && 
              drink.location.lng && 
              !isNaN(drink.location.lng) ? (
                <MapControls.Marker
                  key={drink.id}
                  latitude={Number(drink.location.lat)}
                  longitude={Number(drink.location.lng)}
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedDrink(drink);
                  }}
                >
                  <Box
                    sx={{
                      width: getMarkerSize(viewport.zoom),
                      height: getMarkerSize(viewport.zoom),
                      backgroundColor: `${getMarkerColor(drink)}80`,
                      border: `2px solid ${getMarkerColor(drink)}`,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: getMarkerColor(drink),
                        transform: 'scale(1.1)',
                        boxShadow: `0 0 10px ${getMarkerColor(drink)}80`,
                      },
                    }}
                  >
                    <DrinkIcon sx={{ 
                      color: 'white',
                      fontSize: getMarkerSize(viewport.zoom) * 0.6 
                    }} />
                  </Box>
                </MapControls.Marker>
              ) : null
            ))}

            {friendDrinks.map((drink) => (
              drink.location && 
              drink.location.lat && 
              !isNaN(drink.location.lat) && 
              drink.location.lng && 
              !isNaN(drink.location.lng) ? (
                <MapControls.Marker
                  key={drink.id}
                  latitude={Number(drink.location.lat)}
                  longitude={Number(drink.location.lng)}
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedDrink(drink);
                  }}
                >
                  <Box
                    sx={{
                      width: getMarkerSize(viewport.zoom),
                      height: getMarkerSize(viewport.zoom),
                      backgroundColor: `${getMarkerColor(drink, 'friend')}80`,
                      border: `2px solid ${getMarkerColor(drink, 'friend')}`,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: getMarkerColor(drink, 'friend'),
                        transform: 'scale(1.1)',
                        boxShadow: `0 0 10px ${getMarkerColor(drink, 'friend')}80`,
                      },
                    }}
                  >
                    <PersonIcon sx={{ 
                      color: 'white',
                      fontSize: getMarkerSize(viewport.zoom) * 0.6 
                    }} />
                  </Box>
                </MapControls.Marker>
              ) : null
            ))}

            {selectedDrink && selectedDrink.location && (
              <MapControls.Popup
                latitude={Number(selectedDrink.location.lat)}
                longitude={Number(selectedDrink.location.lng)}
                onClose={() => setSelectedDrink(null)}
                closeButton={true}
                closeOnClick={false}
                closeButtonProps={{
                  'aria-hidden': false,
                  tabIndex: 0,
                  'aria-label': 'Close popup'
                }}
                className="beer-popup"
                maxWidth={isMobile ? "280px" : "320px"}
                offset={isMobile ? 20 : 25}
              >
                <Box sx={{ p: 1 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    pr: 2 // Space for close button
                  }}>
                    {selectedDrink.brand || 'Unknown Beer'}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 0.5,
                    flexWrap: 'wrap',
                    gap: 0.5
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      {selectedDrink.drinkType || 'Unknown Type'} • {selectedDrink.containerType || 'Unknown Container'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Rating: {selectedDrink.rating || 0}/5
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 1,
                    p: 0.5,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 1
                  }}>
                    <LocationIcon sx={{ 
                      fontSize: isMobile ? '0.9rem' : '1rem', 
                      color: 'var(--beer-amber)',
                      mr: 0.5 
                    }} />
                    <Typography variant="body2" sx={{ 
                      fontSize: isMobile ? '0.75rem' : '0.8rem',
                      flex: 1
                    }}>
                      {selectedDrink.placeInfo ? (
                        selectedDrink.placeInfo.customName || 
                        selectedDrink.placeInfo.placeName || 
                        'Unknown Location'
                      ) : (
                        'Unknown Location'
                      )}
                    </Typography>
                    {onEditLocation && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleEditLocationClick(selectedDrink, e)}
                        sx={{ 
                          p: 0.3,
                          ml: 0.5,
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } 
                        }}
                      >
                        <EditIcon sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }} />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Typography 
                    variant="caption" 
                    display="block" 
                    sx={{ 
                      mt: 1, 
                      color: 'text.secondary',
                      fontSize: isMobile ? '0.65rem' : '0.75rem'
                    }}
                  >
                    {selectedDrink.timestamp instanceof Date 
                      ? selectedDrink.timestamp.toLocaleString()
                      : (
                        selectedDrink.timestamp?.seconds
                          ? new Date(selectedDrink.timestamp.seconds * 1000).toLocaleString()
                          : 'Unknown date'
                      )
                    }
                  </Typography>
                </Box>
              </MapControls.Popup>
            )}
          </>
        )}
      </Map>
    </div>
  );
} 