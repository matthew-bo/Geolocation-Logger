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
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { 
  LocalBar as DrinkIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon 
} from '@mui/icons-material';
import mapboxgl from 'mapbox-gl';
import { useRouter } from 'next/router';

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
  const [viewport, setViewport] = useState({
    latitude: 40,
    longitude: -74.5,
    zoom: 9,
    bearing: 0,
    pitch: 0
  });
  
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    console.log("MapComponent mounted");
    console.log("Drinks data:", drinks);
    console.log("Map reference:", mapRef.current);
    console.log("Mapbox token available:", !!MAPBOX_TOKEN);
    
    if (!MAPBOX_TOKEN) {
      setMapError("Mapbox token not found. Please check your environment variables.");
    }
  }, []);

  // Fit map to markers on load
  useEffect(() => {
    if (drinks.length > 0 && mapRef.current) {
      try {
        const bounds = new mapboxgl.LngLatBounds();
        let hasValidCoordinates = false;

        drinks.forEach(drink => {
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
            padding: 50,
            duration: 1000
          });
        }
      } catch (error) {
        console.error('Error setting map bounds:', error);
        setMapError("Error loading map. Please try refreshing the page.");
      }
    }
  }, [drinks]);

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
        <GeolocateControl position="top-right" />
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />
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

        {/* Friend drinks markers */}
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
            className="beer-popup"
          >
            <Box sx={{ p: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                {selectedDrink.brand || 'Unknown Beer'}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 0.5
              }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedDrink.drinkType || 'Unknown Type'} • {selectedDrink.containerType || 'Unknown Container'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rating: {selectedDrink.rating || 0}/5
                </Typography>
              </Box>
              
              {/* Location information */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1,
                p: 0.5,
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 1
              }}>
                <LocationIcon sx={{ 
                  fontSize: '1rem', 
                  color: 'var(--beer-amber)',
                  mr: 0.5 
                }} />
                <Typography variant="body2" sx={{ 
                  fontSize: '0.8rem',
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
                    <EditIcon sx={{ fontSize: '0.8rem' }} />
                  </IconButton>
                )}
              </Box>
              
              {/* Date/time */}
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
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