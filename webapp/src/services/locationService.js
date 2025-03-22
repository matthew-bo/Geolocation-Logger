import { db } from '../config/firebase';
import { doc, updateDoc, getDoc, collection, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

// Mapbox token from env variables
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Get a meaningful display name for a location
 * @param {Object} drink - Drink object with location data
 * @param {Object} aliases - Optional location aliases mapping
 * @returns {string} A user-friendly location name
 */
const getDisplayNameForLocation = (drink, aliases = {}) => {
  // Add debugging to see what data we're working with
  console.log('Processing location for drink:', {
    id: drink.id,
    hasLocation: !!drink.location,
    hasPlaceInfo: !!drink.placeInfo,
    customName: drink.placeInfo?.customName,
    placeName: drink.placeInfo?.placeName,
    address: drink.placeInfo?.address,
    neighborhood: drink.placeInfo?.neighborhood,
    city: drink.placeInfo?.city,
    region: drink.placeInfo?.region,
    coords: drink.location ? `${drink.location.lat},${drink.location.lng}` : 'none'
  });

  if (!drink.placeInfo) return "Unknown Location";

  // First priority: check for alias if we have an address
  if (drink.placeInfo.address && aliases[drink.placeInfo.address]) {
    return aliases[drink.placeInfo.address];
  }
  
  // Second priority: custom name set by user
  if (drink.placeInfo.customName) {
    return drink.placeInfo.customName;
  } 
  
  // Third priority: place name from API
  if (drink.placeInfo.placeName) {
    return drink.placeInfo.placeName;
  } 
  
  // Fourth priority: address from API
  if (drink.placeInfo.address) {
    // Clean up the address to be more readable
    let address = drink.placeInfo.address;
    
    // If the address includes coordinates, try to use other location info
    if (address.includes('(') && address.includes(',')) {
      if (drink.placeInfo.neighborhood) {
        return drink.placeInfo.neighborhood;
      }
      if (drink.placeInfo.city && drink.placeInfo.region) {
        return `${drink.placeInfo.city}, ${drink.placeInfo.region}`;
      }
    }
    
    // Remove country from address if it exists
    if (drink.placeInfo.country) {
      address = address.replace(`, ${drink.placeInfo.country}`, '');
    }
    
    return address;
  }
  
  // Fifth priority: neighborhood or city if available
  if (drink.placeInfo.neighborhood) {
    return drink.placeInfo.neighborhood;
  }
  
  if (drink.placeInfo.city) {
    return `${drink.placeInfo.city}${drink.placeInfo.region ? `, ${drink.placeInfo.region}` : ''}`;
  }
  
  // Last resort: coordinates but formatted to be more readable
  if (drink.location && typeof drink.location.lat === 'number' && typeof drink.location.lng === 'number') {
    // Format as "Location near [nearest city/region]" if available
    if (drink.placeInfo.nearestCity) {
      return `Location near ${drink.placeInfo.nearestCity}`;
    }
    
    // If we have a region/state, at least mention that
    if (drink.placeInfo.region) {
      return `Location in ${drink.placeInfo.region}`;
    }
    
    // If we have coordinates but no other info, show "Location at [coordinates]"
    return `Location at (${drink.location.lat.toFixed(6)}, ${drink.location.lng.toFixed(6)})`;
  }
  
  // If we couldn't get a meaningful name, use "Unknown Location"
  return "Unknown Location";
};

/**
 * Get location statistics for an array of drinks
 * @param {Array} drinks - Array of drink objects
 * @param {Object} aliases - Location aliases mapping
 * @returns {Object} Location statistics
 */
const getLocationStats = async (drinks, userId = null) => {
  try {
    console.log(`Processing ${drinks.length} drinks for location stats`);
    
    // Get location aliases if userId is provided
    let aliases = {};
    if (userId) {
      try {
        const aliasesDoc = doc(db, 'locationAliases', userId);
        const aliasesSnap = await getDoc(aliasesDoc);
        if (aliasesSnap.exists()) {
          aliases = aliasesSnap.data().aliases || {};
        }
      } catch (error) {
        console.error('Error fetching aliases for stats:', error);
      }
    }
    
    // Inspect raw data to see what location information is available
    const locationDataCheck = drinks.reduce((stats, drink) => {
      stats.total++;
      if (drink.location) stats.withLocation++;
      if (drink.placeInfo) stats.withPlaceInfo++;
      if (drink.placeInfo?.customName) stats.withCustomName++;
      if (drink.placeInfo?.placeName) stats.withPlaceName++;
      if (drink.placeInfo?.address) stats.withAddress++;
      if (drink.placeInfo?.city) stats.withCity++;
      return stats;
    }, { 
      total: 0, 
      withLocation: 0, 
      withPlaceInfo: 0, 
      withCustomName: 0, 
      withPlaceName: 0, 
      withAddress: 0,
      withCity: 0
    });
    
    console.log('Drink location data summary:', locationDataCheck);
    
    // More strict filtering to ensure we have useful location data
    const drinksWithLocation = drinks.filter(drink => 
      drink.location && 
      (drink.location.lat || drink.location.lng || 
       drink.placeInfo?.placeName || 
       drink.placeInfo?.address || 
       drink.placeInfo?.city)
    );
    
    console.log(`Found ${drinksWithLocation.length} drinks with usable location data`);
    
    if (drinksWithLocation.length === 0) {
      return {
        topPlaces: [],
        visitedCities: [],
        visitedStates: [],
        visitedCountries: []
      };
    }
    
    // Count places - now directly use getDisplayNameForLocation 
    // to build consistent keys for place names
    const placeCounts = {};
    const cities = {};
    const states = {};
    const countries = {};
    
    // Create a map to track which display name belongs to which original place info
    // This will help debug issues where coordinates are showing instead of names
    const placeNameMapping = {};
    
    drinksWithLocation.forEach(drink => {
      // Get display name for this location using aliases
      const displayName = getDisplayNameForLocation(drink, aliases);
      
      // Store mapping between display name and original place info for debugging
      if (!placeNameMapping[displayName]) {
        placeNameMapping[displayName] = {
          firstDrinkId: drink.id,
          placeInfo: { ...drink.placeInfo },
          coords: drink.location ? { lat: drink.location.lat, lng: drink.location.lng } : null
        };
      }
      
      // Count this place
      placeCounts[displayName] = (placeCounts[displayName] || 0) + 1;
      
      // Count city if available
      if (drink.placeInfo?.city) {
        const cityName = drink.placeInfo.city;
        cities[cityName] = (cities[cityName] || 0) + 1;
      }
      
      // Count state if available
      if (drink.placeInfo?.region) {
        const stateName = drink.placeInfo.region;
        states[stateName] = (states[stateName] || 0) + 1;
      }
      
      // Count country if available
      if (drink.placeInfo?.country) {
        const countryName = drink.placeInfo.country;
        countries[countryName] = (countries[countryName] || 0) + 1;
      }
    });
    
    // Log the place name mapping for debugging
    console.log('Place name mapping:', placeNameMapping);
    
    // Convert to arrays and sort
    const topPlaces = Object.entries(placeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
      
    const visitedCities = Object.entries(cities)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
      
    const visitedStates = Object.entries(states)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
      
    const visitedCountries = Object.entries(countries)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    console.log(`Top places: ${JSON.stringify(topPlaces.slice(0, 3))}`);
    
    return {
      topPlaces,
      visitedCities,
      visitedStates,
      visitedCountries
    };
  } catch (error) {
    console.error('Error calculating location stats:', error);
    // Return empty arrays to avoid breaking the UI
    return {
      topPlaces: [],
      visitedCities: [],
      visitedStates: [],
      visitedCountries: []
    };
  }
};

/**
 * Service for handling location data
 */
const locationService = {
  /**
   * Get place name from coordinates using Mapbox's reverse geocoding
   * @param {Object} coordinates - Lat/lng coordinates
   * @returns {Promise<Object>} Location data including place name and address
   */
  async getPlaceFromCoordinates(coordinates) {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      console.error('Invalid coordinates provided', coordinates);
      return null;
    }

    try {
      // Use Mapbox's reverse geocoding API
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.lng},${coordinates.lat}.json?access_token=${MAPBOX_TOKEN}&types=poi`;
      const response = await fetch(url);
      const data = await response.json();

      // Extract relevant location data
      if (data.features && data.features.length > 0) {
        const place = data.features[0];
        const address = place.place_name;
        const placeName = place.text;
        const placeType = place.properties?.category || 'unknown';
        const neighborhood = data.features.find(f => f.place_type.includes('neighborhood'))?.text || '';
        const city = data.features.find(f => f.place_type.includes('place'))?.text || '';
        const region = data.features.find(f => f.place_type.includes('region'))?.text || '';
        const country = data.features.find(f => f.place_type.includes('country'))?.text || '';
        
        return {
          placeName,
          placeType,
          address,
          neighborhood,
          city,
          region,
          country,
          isAutomaticallyGenerated: true
        };
      }
      
      // Handle case where no POI was found - use reverse geocoding for address
      const addressUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.lng},${coordinates.lat}.json?access_token=${MAPBOX_TOKEN}`;
      const addressResponse = await fetch(addressUrl);
      const addressData = await addressResponse.json();
      
      if (addressData.features && addressData.features.length > 0) {
        const place = addressData.features[0];
        const address = place.place_name;
        const neighborhood = addressData.features.find(f => f.place_type.includes('neighborhood'))?.text || '';
        const city = addressData.features.find(f => f.place_type.includes('place'))?.text || '';
        const region = addressData.features.find(f => f.place_type.includes('region'))?.text || '';
        const country = addressData.features.find(f => f.place_type.includes('country'))?.text || '';
        
        return {
          placeName: 'Unknown Location',
          placeType: 'location',
          address,
          neighborhood,
          city,
          region,
          country,
          isAutomaticallyGenerated: true
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting place info from coordinates:', error);
      return null;
    }
  },

  /**
   * Update a drink's location with place information
   * @param {string} drinkId - ID of the drink to update
   * @param {Object} placeInfo - Place information to store
   * @returns {Promise<boolean>} Success status
   */
  async updateDrinkLocation(drinkId, placeInfo) {
    try {
      if (!drinkId) return false;
      
      const drinkRef = doc(db, 'drinks', drinkId);
      await updateDoc(drinkRef, {
        placeInfo
      });
      
      return true;
    } catch (error) {
      console.error('Error updating drink location:', error);
      return false;
    }
  },
  
  /**
   * Get location statistics for a user
   * @param {string} userId - User ID to get statistics for
   * @returns {Promise<Object>} Location statistics
   */
  async getLocationStats(userId) {
    try {
      // This would be implemented when we have location data available
      return {
        topPlaces: [],
        visitedCities: [],
        visitedCountries: []
      };
    } catch (error) {
      console.error('Error getting location stats:', error);
      return null;
    }
  },

  getDisplayNameForLocation,
  getLocationStats,

  // Get all location aliases for a user
  async getUserLocationAliases(userId) {
    try {
      const aliasesDoc = doc(db, 'locationAliases', userId);
      const aliasesSnap = await getDoc(aliasesDoc);
      if (!aliasesSnap.exists()) {
        return {};
      }
      return aliasesSnap.data().aliases || {};
    } catch (error) {
      console.error('Error fetching location aliases:', error);
      return {};
    }
  },

  // Set a location alias
  async setLocationAlias(userId, originalAddress, customName) {
    try {
      if (!originalAddress || customName.length > 40) return false;
      
      const aliasesDoc = doc(db, 'locationAliases', userId);
      const aliasesSnap = await getDoc(aliasesDoc);
      
      const aliases = aliasesSnap.exists() ? aliasesSnap.data().aliases || {} : {};
      aliases[originalAddress] = customName;
      
      await setDoc(aliasesDoc, {
        aliases,
        updatedAt: new Date()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error setting location alias:', error);
      return false;
    }
  },

  // Remove a location alias
  async removeLocationAlias(userId, originalAddress) {
    try {
      const aliasesDoc = doc(db, 'locationAliases', userId);
      const aliasesSnap = await getDoc(aliasesDoc);
      
      if (!aliasesSnap.exists()) return true;
      
      const aliases = aliasesSnap.data().aliases || {};
      delete aliases[originalAddress];
      
      await setDoc(aliasesDoc, {
        aliases,
        updatedAt: new Date()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error removing location alias:', error);
      return false;
    }
  },

  // Get display name for a location
  async getLocationDisplayName(userId, placeInfo) {
    if (!placeInfo) return 'Unknown Location';
    
    const address = placeInfo.address;
    if (!address) {
      return placeInfo.neighborhood ? 
        `${placeInfo.neighborhood}, ${placeInfo.city}` : 
        'Unknown Location';
    }

    try {
      const aliasesDoc = doc(db, 'locationAliases', userId);
      const aliasesSnap = await getDoc(aliasesDoc);
      
      if (aliasesSnap.exists()) {
        const aliases = aliasesSnap.data().aliases || {};
        if (aliases[address]) {
          return aliases[address];
        }
      }
    } catch (error) {
      console.error('Error getting location alias:', error);
    }

    return address;
  }
};

export default locationService; 