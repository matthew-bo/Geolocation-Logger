import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, IconButton, Button, Menu, Divider, Chip, useTheme as usePaperTheme, Portal, Modal, List, Switch } from 'react-native-paper';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { format, subDays, subMonths, parseISO, isValid } from 'date-fns';
import { theme } from '../theme/theme';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { fetchDrinksWithPagination, clearDrinksCache } from '../utils/drinkUtils';
import DrinkCluster from '../components/DrinkCluster';
import SuperCluster from 'supercluster';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const DEFAULT_LOCATION = {
  latitude: 40.7128,
  longitude: -74.0060,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const timeFrameOptions = [
  { label: 'Last 24 Hours', value: 24 },
  { label: 'Last Week', value: 168 },
  { label: 'Last Month', value: 720 },
  { label: 'All Time', value: -1 },
];

const ratingOptions = [
  { label: 'All Ratings', value: -1 },
  { label: '1+ Stars', value: 1 },
  { label: '2+ Stars', value: 2 },
  { label: '3+ Stars', value: 3 },
  { label: '4+ Stars', value: 4 },
  { label: '5 Stars', value: 5 },
];

const CONTAINER_TYPES = [
  { value: "pint", label: "Pint Glass" },
  { value: "bottle", label: "Bottle" },
  { value: "can", label: "Can" },
  { value: "mug", label: "Mug" },
  { value: "other", label: "Other" }
];

const BEER_SIZES = [
  { value: 12, label: 'Standard (12 oz)' },
  { value: 16, label: 'Guinness (16 oz)' },
  { value: 18, label: 'Mid-West Tall Boy (18 oz)' },
  { value: 24, label: 'Tall Boy (24 oz)' },
  { value: 0, label: 'Other' },
];

const formatTimestamp = (timestamp) => {
  try {
    if (!timestamp) return 'Date not available';
    
    // Handle different timestamp formats
    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = parseISO(timestamp);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (timestamp?.seconds) {
      // Handle Firestore Timestamp
      date = new Date(timestamp.seconds * 1000);
    } else {
      return 'Invalid date format';
    }

    if (!isValid(date)) return 'Invalid date';
    return format(date, 'PPpp');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const DrinkMarker = ({ drink, onPress }) => {
  const getMarkerColor = (drink) => {
    // Get color based on drink type
    const drinkType = drink.drinkType?.toLowerCase();
    if (drinkType && theme.colors.beer.types[drinkType]) {
      return theme.colors.beer.types[drinkType];
    }
    return drink.isFriendsDrink ? theme.colors.success : theme.colors.beer.amber;
  };

  const markerColor = getMarkerColor(drink);
  const markerSize = 30;

  return (
    <Marker
      coordinate={{
        latitude: drink.location.latitude,
        longitude: drink.location.longitude
      }}
      onPress={() => onPress(drink)}
    >
      <View style={{
        width: markerSize,
        height: markerSize,
        backgroundColor: `${markerColor}80`,
        borderColor: markerColor,
        borderWidth: 2,
        borderRadius: markerSize / 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <MaterialCommunityIcons
          name={drink.isFriendsDrink ? "account" : "beer"}
          size={16}
          color={theme.colors.text.primary}
        />
      </View>
    </Marker>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Map Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text>Something went wrong with the map.</Text>
          <Button 
            mode="contained" 
            onPress={() => this.setState({ hasError: false })}
            style={{ marginTop: 10 }}
          >
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const CLUSTER_MAX_ZOOM = 20;
const CLUSTER_RADIUS = 50;
const CLUSTER_MIN_ZOOM = 1;
const DRINKS_PER_BATCH = 50;

const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen({ route }) {
  const { user, userData } = useAuth();
  const isMountedRef = useRef(true);
  const mapRef = useRef(null);
  const locationSubscriptionRef = useRef(null);
  const paperTheme = usePaperTheme();
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState(INITIAL_REGION);
  const [timeFrame, setTimeFrame] = useState(-1);
  const [minRating, setMinRating] = useState(-1);
  const [showTimeFrameMenu, setShowTimeFrameMenu] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showContainerMenu, setShowContainerMenu] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedContainers, setSelectedContainers] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [drinks, setDrinks] = useState([]);
  const [showFriendsDrinks, setShowFriendsDrinks] = useState(false);
  const [friendsDrinks, setFriendsDrinks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [clusters, setClusters] = useState([]);
  const superclusterRef = useRef(null);
  const loadingRef = useRef(false);
  const [showDrinkDetails, setShowDrinkDetails] = useState(false);

  // Get unique drink types, containers, and locations
  useEffect(() => {
    const types = new Set();
    const containers = new Set();
    const locations = new Set();

    drinks.forEach(drink => {
      if (drink.type) types.add(drink.type);
      if (drink.container) containers.add(drink.container);
      if (drink.location) {
        locations.add(`${drink.location.latitude},${drink.location.longitude}`);
      }
    });

    setSelectedTypes(Array.from(types));
    setSelectedContainers(Array.from(containers));
    setSelectedLocations(Array.from(locations));
  }, [drinks]);

  const loadDrinks = useCallback(async (isRefresh = false) => {
    if (loadingRef.current || (!hasMore && !isRefresh)) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      // Enhanced validation
      if (!user?.uid) {
        console.log('No user ID available:', user);
        throw new Error('Please log in to view drinks');
      }

      console.log('Loading drinks with showFriendsDrinks:', showFriendsDrinks);

      // Get friend IDs from friendships collection
      let friendIds = [];
      if (showFriendsDrinks) {
        const friendshipsQuery = query(collection(db, 'friendships'),
          where('user1', '==', user.uid));
        const friendshipsQuery2 = query(collection(db, 'friendships'),
          where('user2', '==', user.uid));
        
        const [friendships1, friendships2] = await Promise.all([
          getDocs(friendshipsQuery),
          getDocs(friendshipsQuery2)
        ]);

        friendIds = [
          ...friendships1.docs.map(doc => doc.data().user2),
          ...friendships2.docs.map(doc => doc.data().user1)
        ];

        console.log('Found friend IDs:', friendIds);
      }

      console.log('Fetching drinks with params:', {
        userId: user.uid,
        timeFrame,
        minRating,
        includeUserDrinks: true,
        includeFriendsDrinks: showFriendsDrinks,
        friendIds: friendIds.length
      });

      const result = await fetchDrinksWithPagination({
        userId: user.uid,
        timeFrame: timeFrame || -1,
        minRating: minRating || -1,
        lastVisible: isRefresh ? null : lastVisible,
        includeUserDrinks: true,
        includeFriendsDrinks: showFriendsDrinks,
        friendIds,
        limit: DRINKS_PER_BATCH
      });

      console.log('Fetched drinks:', result.drinks.length);
      console.log('Sample drink:', result.drinks[0]);
      
      if (isRefresh) {
        console.log('Refreshing drinks list');
        setDrinks(result.drinks);
      } else {
        console.log('Appending drinks to list');
        setDrinks(prev => [...prev, ...result.drinks]);
      }
      
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);

      // Log current state
      setTimeout(() => {
        console.log('Current drinks state:', drinks.length);
      }, 100);
    } catch (error) {
      console.error('Error loading drinks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [user?.uid, timeFrame, minRating, lastVisible, hasMore, showFriendsDrinks]);

  // Add effect to reload drinks when showFriendsDrinks changes
  useEffect(() => {
    if (isMapReady) {
      console.log('Friends toggle changed:', showFriendsDrinks);
      setDrinks([]); // Clear existing drinks
      setLastVisible(null);
      setHasMore(true);
      loadDrinks(true).catch(error => {
        console.error('Error reloading drinks:', error);
        setError('Failed to load drinks. Please try again.');
      });
    }
  }, [showFriendsDrinks, isMapReady]);

  const handleRegionChange = useCallback((newRegion) => {
    setRegion(newRegion);
  }, []);

  const handleRegionChangeComplete = useCallback((newRegion) => {
    if (hasMore && !loadingRef.current) {
      loadDrinks();
    }
  }, [hasMore, loadDrinks]);

  const updateClusters = useCallback(() => {
    if (!superclusterRef.current || !drinks.length || !region) return [];

    const points = drinks.map(drink => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [drink.location.longitude, drink.location.latitude]
      },
      properties: drink
    }));

    superclusterRef.current.load(points);
    
    const zoom = Math.round(Math.log2(360 / region.longitudeDelta) + 1);
    const bbox = [
      region.longitude - region.longitudeDelta,
      region.latitude - region.latitudeDelta,
      region.longitude + region.longitudeDelta,
      region.latitude + region.latitudeDelta
    ];

    return superclusterRef.current.getClusters(bbox, zoom);
  }, [drinks, region]);

  useEffect(() => {
    const newClusters = updateClusters();
    setClusters(newClusters);
  }, [updateClusters]);

  const handleMarkerPress = useCallback((marker) => {
    if (marker.properties.cluster) {
      const children = superclusterRef.current.getLeaves(marker.id);
      if (children.length === 1) {
        setSelectedDrink(children[0].properties);
        setShowDrinkDetails(true);
      } else {
        const coordinates = marker.geometry.coordinates;
        mapRef.current?.animateToRegion({
          latitude: coordinates[1],
          longitude: coordinates[0],
          latitudeDelta: region.latitudeDelta / 2,
          longitudeDelta: region.longitudeDelta / 2,
        });
      }
    } else {
      setSelectedDrink(marker.properties);
      setShowDrinkDetails(true);
    }
  }, [region]);

  const handleMapReady = () => {
    setIsMapReady(true);
    loadDrinks(true);
  };

  useEffect(() => {
    const setupLocation = async () => {
      if (!isMountedRef.current) return;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setError('Location permission denied');
          setMapError('Please enable location services to use all map features');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMountedRef.current) return;

        if (location?.coords) {
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });
          setRegion({
            latitude,
            longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
        }

        // Setup location updates
        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          (newLocation) => {
            if (isMountedRef.current && newLocation?.coords) {
              setUserLocation({
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
              });
            }
          }
        );
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error('Location setup error:', err);
        setError(err.message);
        setMapError('Error accessing location services');
      }
    };

    setupLocation();

    return () => {
      isMountedRef.current = false;
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current || !route?.params?.selectedDrink) return;

    const drink = route.params.selectedDrink;
    if (drink?.location?.lat && drink?.location?.lng) {
      const drinkLocation = {
        latitude: Number(drink.location.lat),
        longitude: Number(drink.location.lng),
        latitudeDelta: LATITUDE_DELTA / 4,
        longitudeDelta: LONGITUDE_DELTA / 4,
      };
      setRegion(drinkLocation);
      setSelectedDrink(drink);
    }
  }, [route?.params?.selectedDrink]);

  // Memoize filtered drinks
  const filteredDrinks = useMemo(() => {
    let allDrinks = [...drinks];
    if (showFriendsDrinks) {
      allDrinks = [...allDrinks, ...friendsDrinks];
    }
    
    return allDrinks.filter(drink => {
      if (!drink?.timestamp) return false;

      if (timeFrame !== -1) {
        const drinkDate = new Date(drink.timestamp);
        const now = new Date();
        const hoursDiff = (now - drinkDate) / (1000 * 60 * 60);
        if (hoursDiff > timeFrame) return false;
      }

      if (minRating !== -1 && (!drink?.rating || drink.rating < minRating)) {
        return false;
      }

      if (!drink?.location?.latitude || !drink?.location?.longitude) {
        return false;
      }

      if (selectedTypes.length > 0 && !selectedTypes.includes(drink.drinkType)) {
        return false;
      }

      if (selectedContainers.length > 0 && !selectedContainers.includes(drink.container)) {
        return false;
      }

      if (selectedLocations.length > 0) {
        const matchesLocation = selectedLocations.some(loc => 
          drink.placeInfo?.city === loc ||
          drink.placeInfo?.state === loc ||
          drink.placeInfo?.country === loc
        );
        if (!matchesLocation) return false;
      }

      return true;
    });
  }, [drinks, showFriendsDrinks, timeFrame, minRating, selectedTypes, selectedContainers, selectedLocations, friendsDrinks]);

  useEffect(() => {
    const fetchFriendsDrinks = async () => {
      if (!user?.uid || !showFriendsDrinks) {
        setFriendsDrinks([]);
        return;
      }

      // Validate friends list
      const validFriendIds = userData?.friends?.filter(id => id && typeof id === 'string') || [];
      if (validFriendIds.length === 0) {
        console.log('No valid friend IDs to fetch drinks for');
        setFriendsDrinks([]);
        return;
      }
      
      try {
        console.log('Fetching drinks for friends:', validFriendIds.length);
        const drinksRef = collection(db, 'drinks');
        const q = query(
          drinksRef,
          where('userId', 'in', validFriendIds),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
        
        const querySnapshot = await getDocs(q);
        const friendsDrinksData = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            if (!data) return null;

            // Validate location data
            let lat, lng;
            if (data.location?.latitude !== undefined) {
              lat = parseFloat(data.location.latitude);
              lng = parseFloat(data.location.longitude);
            } else if (data.location?.lat !== undefined) {
              lat = parseFloat(data.location.lat);
              lng = parseFloat(data.location.lng);
            } else if (typeof data.location === 'object' && data.location !== null) {
              lat = data.location.latitude || data.location._lat;
              lng = data.location.longitude || data.location._long;
            }

            if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
              console.log('Invalid location for friend drink:', doc.id);
              return null;
            }

            return {
              id: doc.id,
              ...data,
              location: { latitude: lat, longitude: lng },
              isFriendsDrink: true
            };
          })
          .filter(Boolean);

        console.log('Fetched valid friend drinks:', friendsDrinksData.length);
        setFriendsDrinks(friendsDrinksData);
      } catch (error) {
        console.error('Error fetching friends drinks:', error);
        setError('Failed to load friends\' drinks. Please try again.');
      }
    };

    fetchFriendsDrinks();
  }, [user?.uid, showFriendsDrinks, userData?.friends]);

  if (mapError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{mapError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ErrorBoundary>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
          onMapReady={handleMapReady}
          showsUserLocation
          showsMyLocationButton
          loadingEnabled
        >
          {clusters.map(cluster => {
            const coordinates = {
              latitude: cluster.geometry.coordinates[1],
              longitude: cluster.geometry.coordinates[0]
            };

            if (cluster.properties.cluster) {
              return (
                <DrinkCluster
                  key={`cluster-${cluster.id}`}
                  coordinate={coordinates}
                  pointCount={cluster.properties.point_count}
                  onPress={() => handleMarkerPress(cluster)}
                />
              );
            }

            return (
              <DrinkMarker
                key={`drink-${cluster.properties.id}`}
                coordinate={coordinates}
                drink={cluster.properties}
                onPress={() => handleMarkerPress(cluster)}
              />
            );
          })}
        </MapView>
      </ErrorBoundary>

      <IconButton
        icon={showFilters ? "chevron-up" : "chevron-down"}
        size={24}
        onPress={() => setShowFilters(!showFilters)}
        style={styles.filterToggle}
        mode="contained"
      />

      {showFilters && (
        <View style={styles.filterWrapper}>
          <Card style={styles.filtersCard}>
            <Card.Content>
              <View style={styles.filterSection}>
                <View style={styles.filterHeader}>
                  <Text style={styles.filterTitle}>Friends' Drinks</Text>
                  <Switch
                    value={showFriendsDrinks}
                    onValueChange={setShowFriendsDrinks}
                    color={theme.colors.beer.amber}
                  />
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Time Frame</Text>
                <Menu
                  visible={showTimeFrameMenu}
                  onDismiss={() => setShowTimeFrameMenu(false)}
                  anchor={
                    <Button
                      mode="contained"
                      onPress={() => setShowTimeFrameMenu(true)}
                      style={styles.filterButton}
                      textColor="white"
                    >
                      {timeFrameOptions.find(opt => opt.value === timeFrame)?.label || 'Time Frame'}
                    </Button>
                  }
                  contentStyle={styles.menuContent}
                >
                  {timeFrameOptions.map((option) => (
                    <Menu.Item
                      key={option.value}
                      onPress={() => {
                        setTimeFrame(option.value);
                        setShowTimeFrameMenu(false);
                      }}
                      title={option.label}
                      titleStyle={styles.menuItemText}
                      style={[
                        styles.menuItem,
                        timeFrame === option.value && styles.menuItemSelected
                      ]}
                    />
                  ))}
                </Menu>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Rating</Text>
                <View style={styles.ratingChips}>
                  {ratingOptions.map((option) => (
                    <Chip
                      key={option.value}
                      selected={minRating === option.value}
                      onPress={() => setMinRating(option.value)}
                      style={styles.chip}
                      selectedColor={theme.colors.beer.amber}
                      textStyle={styles.chipText}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Type</Text>
                <Menu
                  visible={showTypeMenu}
                  onDismiss={() => setShowTypeMenu(false)}
                  anchor={
                    <Button
                      mode="contained"
                      onPress={() => setShowTypeMenu(true)}
                      style={styles.filterButton}
                      textColor={theme.colors.text.primary}
                    >
                      {selectedTypes.length > 0 ? `${selectedTypes.length} selected` : 'All Types'}
                    </Button>
                  }
                  contentStyle={styles.menuContent}
                >
                  {selectedTypes.map((type) => (
                    <Menu.Item
                      key={type}
                      onPress={() => toggleType(type)}
                      title={type}
                      titleStyle={styles.menuItemText}
                      style={styles.menuItem}
                      leadingIcon={selectedTypes.includes(type) ? "check" : undefined}
                    />
                  ))}
                </Menu>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Container</Text>
                <Menu
                  visible={showContainerMenu}
                  onDismiss={() => setShowContainerMenu(false)}
                  anchor={
                    <Button
                      mode="contained"
                      onPress={() => setShowContainerMenu(true)}
                      style={styles.filterButton}
                      textColor={theme.colors.text.primary}
                    >
                      {selectedContainers.length > 0 ? `${selectedContainers.length} selected` : 'All Containers'}
                    </Button>
                  }
                  contentStyle={styles.menuContent}
                >
                  {CONTAINER_TYPES.map((container) => (
                    <Menu.Item
                      key={container.value}
                      onPress={() => toggleContainer(container.value)}
                      title={container.label}
                      titleStyle={styles.menuItemText}
                      style={styles.menuItem}
                      leadingIcon={selectedContainers.includes(container.value) ? "check" : undefined}
                    />
                  ))}
                </Menu>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}

      <Portal>
        {selectedDrink && (
          <Modal
            visible={showDrinkDetails}
            onDismiss={() => setShowDrinkDetails(false)}
            contentContainerStyle={styles.modal}
          >
            <Card style={styles.modalCard}>
              <Card.Content>
                <View style={styles.modalHeader}>
                  <Text variant="titleLarge" style={styles.modalTitle}>
                    {selectedDrink.name || 'Unnamed Drink'}
                  </Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowDrinkDetails(false)}
                    style={styles.closeIcon}
                  />
                </View>

                <ScrollView style={styles.modalScroll}>
                  <View style={styles.modalInfoRow}>
                    <MaterialCommunityIcons name="star" size={20} color={theme.colors.beer.amber} />
                    <Text variant="bodyLarge" style={styles.modalText}>
                      {selectedDrink.rating ? `${selectedDrink.rating} ⭐` : 'No rating'}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <MaterialCommunityIcons name="beer" size={20} color={theme.colors.beer.amber} />
                    <Text variant="bodyMedium" style={styles.modalText}>
                      {selectedDrink.drinkType || 'Type not specified'} • {selectedDrink.container || 'Container not specified'}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.beer.amber} />
                    <Text variant="bodyMedium" style={styles.modalText}>
                      {formatTimestamp(selectedDrink.timestamp)}
                    </Text>
                  </View>

                  {selectedDrink.notes && (
                    <View style={styles.modalInfoRow}>
                      <MaterialCommunityIcons name="note-text" size={20} color={theme.colors.beer.amber} />
                      <Text variant="bodyMedium" style={styles.modalText}>
                        {selectedDrink.notes}
                      </Text>
                    </View>
                  )}

                  {selectedDrink.placeInfo && (
                    <View style={styles.modalInfoRow}>
                      <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.beer.amber} />
                      <Text variant="bodyMedium" style={styles.modalText}>
                        {selectedDrink.placeInfo.name || selectedDrink.placeInfo.placeName || 'Location not specified'}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </Card.Content>
            </Card>
          </Modal>
        )}
      </Portal>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.beer.amber} />
        </View>
      )}

      {error && (
        <Portal>
          <Modal
            visible={!!error}
            onDismiss={() => setError(null)}
            contentContainerStyle={styles.errorModal}
          >
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="contained" onPress={() => {
              setError(null);
              loadDrinks(true);
            }}>
              Retry
            </Button>
          </Modal>
        </Portal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
  },
  filterWrapper: {
    position: 'absolute',
    top: 72,
    left: 16,
    right: 16,
    maxHeight: '40%',
  },
  filtersCard: {
    backgroundColor: theme.colors.glass.background,
    borderColor: theme.colors.glass.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.beer.amber,
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: theme.colors.beer.amber,
    width: '100%',
  },
  menuContent: {
    backgroundColor: '#000000',
    borderColor: theme.colors.glass.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    marginTop: 4,
    padding: 8,
    minWidth: 200,
  },
  menuItem: {
    backgroundColor: '#000000',
    borderRadius: theme.borderRadius.sm,
    marginVertical: 2,
  },
  menuItemSelected: {
    backgroundColor: theme.colors.beer.amber,
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  divider: {
    backgroundColor: theme.colors.glass.border,
    marginVertical: 12,
  },
  ratingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: theme.colors.glass.background,
    borderColor: theme.colors.beer.amber,
    borderWidth: 1,
  },
  chipText: {
    color: theme.colors.text.primary,
  },
  marker: {
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    margin: 20,
  },
  filterToggle: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: theme.colors.glass.background,
    borderColor: theme.colors.glass.border,
    borderWidth: 1,
  },
  modal: {
    margin: 20,
  },
  modalCard: {
    backgroundColor: theme.colors.background,
    margin: 16,
    borderRadius: theme.borderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: theme.colors.beer.amber,
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    flex: 1,
  },
  closeIcon: {
    margin: -8,
  },
  modalScroll: {
    maxHeight: '70%',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: `${theme.colors.glass.background}80`,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    gap: 12,
  },
  modalText: {
    color: theme.colors.text.primary,
    flex: 1,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
  clusterDrinkItem: {
    padding: 12,
    backgroundColor: theme.colors.glass.background,
    borderRadius: theme.borderRadius.md,
  },
  drinkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  drinkName: {
    color: theme.colors.beer.amber,
    fontSize: 18,
    fontFamily: theme.fonts.bold,
  },
  drinkRating: {
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  drinkDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
}); 