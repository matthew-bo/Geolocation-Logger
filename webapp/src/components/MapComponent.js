import { useState, useEffect, useRef, useMemo } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  ScaleControl,
  FullscreenControl,
  GeolocateControl,
  Source,
  Layer
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
  const [hoveredPointId, setHoveredPointId] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const { user } = useAuth();

  // Convert drinks to GeoJSON format for clustering
  const drinksGeoJSON = useMemo(() => {
    const features = [];
    
    // Add user drinks
    drinks.forEach(drink => {
      if (drink.location && 
          drink.location.lat && 
          !isNaN(drink.location.lat) && 
          drink.location.lng && 
          !isNaN(drink.location.lng)) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [Number(drink.location.lng), Number(drink.location.lat)]
          },
          properties: {
            id: drink.id,
            type: 'user',
            drink: drink
          }
        });
      }
    });

    // Add friend drinks
    friendDrinks.forEach(drink => {
      if (drink.location && 
          drink.location.lat && 
          !isNaN(drink.location.lat) && 
          drink.location.lng && 
          !isNaN(drink.location.lng)) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [Number(drink.location.lng), Number(drink.location.lat)]
          },
          properties: {
            id: drink.id,
            type: 'friend',
            drink: drink
          }
        });
      }
    });

    return {
      type: 'FeatureCollection',
      features: features
    };
  }, [drinks, friendDrinks]);

  // Calculate initial view state based on beers data
  const initialViewState = useMemo(() => {
    if (drinksGeoJSON.features.length === 0) {
      // Default to a reasonable location if no beers
      return {
        latitude: 40,
        longitude: -74.5,
        zoom: 9,
        bearing: 0,
        pitch: 0
      };
    }

    // Calculate bounds from all beers
    const bounds = new mapboxgl.LngLatBounds();
    drinksGeoJSON.features.forEach(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      bounds.extend([lng, lat]);
    });

    // Get center and zoom from bounds
    const center = bounds.getCenter();
    const zoom = Math.min(12, Math.max(9, bounds.getZoom() - 1)); // Adjust zoom level

    return {
      latitude: center.lat,
      longitude: center.lng,
      zoom: zoom,
      bearing: 0,
      pitch: 0
    };
  }, [drinksGeoJSON]);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setMapError("Mapbox token not found. Please check your environment variables.");
    }
  }, []);

  // Handle cluster click
  const onClusterClick = (event) => {
    const feature = event.features[0];
    const clusterId = feature.properties.cluster_id;
    const mapboxSource = mapRef.current.getMap().getSource('drinks');
    
    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        return;
      }

      // Add extra zoom to make it easier to see individual beers
      const targetZoom = Math.min(zoom + 1, 16);
      
      mapRef.current.getMap().easeTo({
        center: feature.geometry.coordinates,
        zoom: targetZoom,
        duration: 1000
      });
    });
  };

  // Handle individual marker click
  const onMarkerClick = (event) => {
    const feature = event.features[0];
    if (feature.properties.cluster) {
      onClusterClick(event);
    } else {
      setSelectedDrink(feature.properties.drink);
    }
  };

  // Handle mouse enter on markers
  const onMouseEnter = (event) => {
    const feature = event.features[0];
    if (feature && !feature.properties.cluster) {
      setHoveredPointId(feature.properties.id);
      event.target.getCanvas().style.cursor = 'pointer';
    }
  };

  // Handle mouse leave on markers
  const onMouseLeave = (event) => {
    setHoveredPointId(null);
    event.target.getCanvas().style.cursor = '';
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
        initialViewState={initialViewState}
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
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={onMarkerClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <GeolocateControl 
          position={isMobile ? "bottom-right" : "top-right"}
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
        />
        <FullscreenControl position={isMobile ? "bottom-right" : "top-right"} />
        <NavigationControl position={isMobile ? "bottom-right" : "top-right"} />
        <ScaleControl position="bottom-right" />
        
        <Source
          id="drinks"
          type="geojson"
          data={drinksGeoJSON}
          cluster={true}
          clusterMaxZoom={9}
          clusterRadius={30}
        >
          {/* Clusters */}
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#FBC02D',  // Default color
                10,
                '#FF9800',  // Orange for 10+ beers
                50,
                '#F44336'   // Red for 50+ beers
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,  // Default size
                10,
                25,  // Larger for 10+ beers
                50,
                30   // Even larger for 50+ beers
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff'
            }}
          />
          
          {/* Cluster count labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12,
              'text-allow-overlap': true
            }}
            paint={{
              'text-color': '#000',
              'text-halo-color': '#fff',
              'text-halo-width': 1
            }}
          />
          
          {/* Individual markers (unclustered) */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': [
                'case',
                ['==', ['get', 'type'], 'friend'],
                '#4CAF50',  // Green for friends
                '#FBC02D'   // Amber for user
              ],
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                9, 14,   // At zoom 9, radius 14
                11, 18,  // At zoom 11, radius 18
                13, 22,  // At zoom 13, radius 22
                15, 26   // At zoom 15, radius 26
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff'
            }}
          />
          
          {/* Hover effect for individual markers */}
          <Layer
            id="unclustered-point-hover"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': [
                'case',
                ['==', ['get', 'type'], 'friend'],
                '#4CAF50',  // Green for friends
                '#FBC02D'   // Amber for user
              ],
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                9, 16,   // At zoom 9, radius 16 (slightly larger)
                11, 20,  // At zoom 11, radius 20
                13, 24,  // At zoom 13, radius 24
                15, 28   // At zoom 15, radius 28
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': '#fff',
              'circle-opacity': [
                'case',
                ['==', ['get', 'id'], hoveredPointId],
                1,  // Show when hovered
                0   // Hide when not hovered
              ]
            }}
          />
        </Source>

        {/* Popup for selected drink */}
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