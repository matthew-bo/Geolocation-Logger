import { useState, useEffect, useRef } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  ScaleControl,
  FullscreenControl,
  GeolocateControl
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
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
  LocationOn as LocationIcon 
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function MapComponent({ 
  drinks = [], 
  friendDrinks = [], 
  selectedDrink, 
  setSelectedDrink,
  handleMouseMove,
  getMarkerSize,
  getMarkerColor
}) {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);
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
  const { user } = useAuth();

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setMapError("Mapbox token not found. Please check your environment variables.");
    }
  }, []);

  // Fit map to markers on load
  useEffect(() => {
    if (mapRef.current && drinks.length > 0) {
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

        if (hasValidCoordinates && mapRef.current.getMap) {
          mapRef.current.getMap().fitBounds(bounds, {
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
  }, [drinks, friendDrinks, isMobile]);

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
        <GeolocateControl 
          position={isMobile ? "bottom-right" : "top-right"}
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
        />
        <FullscreenControl position={isMobile ? "bottom-right" : "top-right"} />
        <NavigationControl position={isMobile ? "bottom-right" : "top-right"} />
        <ScaleControl position="bottom-right" />
        
        {drinks.map((drink) => (
          drink.location && 
          drink.location.lat && 
          !isNaN(drink.location.lat) && 
          drink.location.lng && 
          !isNaN(drink.location.lng) ? (
            <Marker
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
            </Marker>
          ) : null
        ))}

        {friendDrinks.map((drink) => (
          drink.location && 
          drink.location.lat && 
          !isNaN(drink.location.lat) && 
          drink.location.lng && 
          !isNaN(drink.location.lng) ? (
            <Marker
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
            </Marker>
          ) : null
        ))}

        {selectedDrink && selectedDrink.location && (
          <Popup
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
          </Popup>
        )}
      </Map>
    </div>
  );
}

export default MapComponent; 