import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const DRINKS_CACHE = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const clearDrinksCache = () => {
  DRINKS_CACHE.clear();
};

export const fetchDrinksWithPagination = async ({
  userId,
  timeFrame = -1,
  minRating = -1,
  lastVisible = null,
  includeUserDrinks = true,
  includeFriendsDrinks = false,
  friendIds = [],
  limit: batchLimit = 50
}) => {
  try {
    // Validate required parameters
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId:', userId);
      throw new Error('Valid user ID is required');
    }

    const drinksRef = collection(db, 'drinks');
    const constraints = [];

    // Add user and friends constraints
    const userIds = [];
    if (includeUserDrinks) {
      userIds.push(userId);
    }
    
    // Validate and add friend IDs
    if (includeFriendsDrinks && Array.isArray(friendIds)) {
      const validFriendIds = friendIds.filter(id => id && typeof id === 'string');
      if (validFriendIds.length > 0) {
        userIds.push(...validFriendIds);
      }
    }
    
    if (userIds.length === 0) {
      console.log('No valid user IDs to query');
      return { drinks: [], lastVisible: null, hasMore: false };
    }

    // Ensure unique IDs
    const uniqueUserIds = [...new Set(userIds)];
    constraints.push(where('userId', 'in', uniqueUserIds));

    // Add time frame constraint if specified
    if (timeFrame > 0) {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - timeFrame);
      constraints.push(where('timestamp', '>=', cutoffDate));
    }

    // Add rating constraint if specified
    if (minRating > 0) {
      constraints.push(where('rating', '>=', minRating));
    }

    // Add ordering
    constraints.push(orderBy('timestamp', 'desc'));

    // Add pagination
    if (lastVisible && lastVisible._document) {
      constraints.push(startAfter(lastVisible));
    }
    
    // Ensure valid batch limit
    const validBatchLimit = Math.max(1, Math.min(batchLimit, 100));
    constraints.push(limit(validBatchLimit + 1));

    console.log('Executing drinks query for userIds:', uniqueUserIds);
    const q = query(drinksRef, ...constraints);
    const querySnapshot = await getDocs(q);
    console.log('Query returned:', querySnapshot.size, 'documents');
    
    const drinks = [];
    let newLastVisible = null;

    querySnapshot.forEach((doc, index) => {
      if (index < validBatchLimit) {
        const data = doc.data();
        if (!data) {
          console.log('No data for document:', doc.id);
          return;
        }

        // Log the raw location data for debugging
        console.log('Raw drink data:', {
          id: doc.id,
          location: data.location,
          locationClass: data.location ? data.location.constructor.name : 'undefined',
          locationKeys: data.location ? Object.keys(data.location) : [],
          locationValues: data.location ? Object.values(data.location) : []
        });

        // Handle location data
        let location = null;
        const rawLocation = data.location;

        if (rawLocation) {
          // Case 1: GeoPoint format
          if (rawLocation._lat !== undefined && rawLocation._long !== undefined) {
            location = {
              latitude: rawLocation._lat,
              longitude: rawLocation._long
            };
            console.log('Processed GeoPoint format:', location);
          }
          // Case 2: lat/lng format
          else if (typeof rawLocation.lat === 'number' && typeof rawLocation.lng === 'number') {
            location = {
              latitude: rawLocation.lat,
              longitude: rawLocation.lng
            };
            console.log('Processed lat/lng format:', location);
          }
          // Case 3: latitude/longitude format
          else if (typeof rawLocation.latitude === 'number' && typeof rawLocation.longitude === 'number') {
            location = {
              latitude: rawLocation.latitude,
              longitude: rawLocation.longitude
            };
            console.log('Processed latitude/longitude format:', location);
          }
          // Case 4: coordinates array format
          else if (Array.isArray(rawLocation) && rawLocation.length === 2) {
            const [lat, lng] = rawLocation;
            if (typeof lat === 'number' && typeof lng === 'number') {
              location = {
                latitude: lat,
                longitude: lng
              };
              console.log('Processed array format:', location);
            }
          }
          // Case 5: string format "lat,lng"
          else if (typeof rawLocation === 'string') {
            const [lat, lng] = rawLocation.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
              location = {
                latitude: lat,
                longitude: lng
              };
              console.log('Processed string format:', location);
            }
          }
        }

        // Log the final processed location
        if (!location) {
          console.log('Failed to process location for drink:', doc.id);
        } else {
          console.log('Successfully processed location:', {
            drinkId: doc.id,
            location,
            isValid: (
              typeof location.latitude === 'number' && 
              typeof location.longitude === 'number' &&
              !isNaN(location.latitude) && 
              !isNaN(location.longitude) &&
              location.latitude >= -90 && 
              location.latitude <= 90 && 
              location.longitude >= -180 && 
              location.longitude <= 180
            )
          });
        }

        // Only add drink if location is valid
        if (location && 
            typeof location.latitude === 'number' && 
            typeof location.longitude === 'number' &&
            !isNaN(location.latitude) && 
            !isNaN(location.longitude) &&
            location.latitude >= -90 && 
            location.latitude <= 90 && 
            location.longitude >= -180 && 
            location.longitude <= 180) {
          drinks.push({
            id: doc.id,
            ...data,
            location,
            isFriendsDrink: data.userId !== userId
          });
          newLastVisible = doc;
        }
      }
    });

    console.log('Processed valid drinks:', drinks.length);
    return {
      drinks,
      lastVisible: newLastVisible,
      hasMore: querySnapshot.size > validBatchLimit
    };
  } catch (error) {
    console.error('Error fetching drinks:', error);
    throw error;
  }
};

const processDrinkLocation = (location) => {
  if (!location) {
    console.log('Missing location data');
    return null;
  }

  console.log('Processing location:', JSON.stringify(location));

  // Handle GeoPoint format
  if (location.constructor.name === 'GeoPoint') {
    console.log('Found GeoPoint format');
    return {
      latitude: location.latitude,
      longitude: location.longitude
    };
  }

  // Handle string coordinates format "lat,lng"
  if (typeof location === 'string') {
    console.log('Found string format:', location);
    const [lat, lng] = location.split(',').map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      return {
        latitude: lat,
        longitude: lng
      };
    }
  }

  // Handle direct lat/lng format
  if (typeof location.lat === 'number' && typeof location.lng === 'number') {
    console.log('Found lat/lng format');
    return {
      latitude: location.lat,
      longitude: location.lng
    };
  }

  // Handle latitude/longitude format
  if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
    console.log('Found latitude/longitude format');
    return {
      latitude: location.latitude,
      longitude: location.longitude
    };
  }

  // Handle _lat/_long format
  if (typeof location._lat === 'number' && typeof location._long === 'number') {
    console.log('Found _lat/_long format');
    return {
      latitude: location._lat,
      longitude: location._long
    };
  }

  // Handle coordinates array format [lat, lng]
  if (Array.isArray(location) && location.length === 2) {
    console.log('Found array format:', location);
    const [lat, lng] = location;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return {
        latitude: lat,
        longitude: lng
      };
    }
  }

  console.log('Invalid location format:', JSON.stringify(location));
  return null;
};

const processDrink = (doc) => {
  const data = doc.data();
  console.log('Processing drink:', doc.id, 'Raw data:', JSON.stringify(data));
  
  const location = processDrinkLocation(data.location);
  if (!location) {
    console.log('Drink rejected - invalid location:', doc.id);
    return null;
  }

  // Validate location bounds
  if (location.latitude < -90 || location.latitude > 90 ||
      location.longitude < -180 || location.longitude > 180) {
    console.log('Drink rejected - location out of bounds:', JSON.stringify(location));
    return null;
  }

  const drink = {
    id: doc.id,
    ...data,
    location,
    timestamp: data.timestamp?.toDate() || data.timestamp
  };

  console.log('Successfully processed drink:', doc.id, 'Final data:', JSON.stringify(drink));
  return drink;
}; 