import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const drinkService = {
  // Log a new drink
  async logDrink(userId, drinkData) {
    try {
      // Add drink to drinks collection
      const docRef = await addDoc(collection(db, 'drinks'), {
        userId,
        ...drinkData,
        timestamp: new Date().toISOString()
      });

      // Get or create user document
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          previousDrinks: [drinkData.drinkName],
          createdAt: new Date().toISOString()
        });
      } else {
        // Update existing user's previous drinks
        await updateDoc(userRef, {
          previousDrinks: arrayUnion(drinkData.drinkName)
        });
      }

      return { success: true, drinkId: docRef.id };
    } catch (error) {
      console.error('Error logging drink:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's drinks
  async getUserDrinks(userId, filters = {}) {
    try {
      let q = query(
        collection(db, 'drinks'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const drinks = [];
      querySnapshot.forEach((doc) => {
        drinks.push({ id: doc.id, ...doc.data() });
      });

      // Apply filters client-side
      return drinks.filter(drink => {
        let match = true;
        if (filters.drinkName) {
          match = match && drink.drinkName.toLowerCase().includes(filters.drinkName.toLowerCase());
        }
        if (filters.container) {
          match = match && drink.container === filters.container;
        }
        if (filters.rating) {
          match = match && drink.rating === filters.rating;
        }
        if (filters.startDate) {
          match = match && new Date(drink.timestamp) >= new Date(filters.startDate);
        }
        if (filters.endDate) {
          match = match && new Date(drink.timestamp) <= new Date(filters.endDate);
        }
        return match;
      });
    } catch (error) {
      console.error('Error getting drinks:', error);
      return [];
    }
  },

  // Get user's previous drinks for autocomplete
  async getPreviousDrinks(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? userDoc.data().previousDrinks || [] : [];
    } catch (error) {
      console.error('Error getting previous drinks:', error);
      return [];
    }
  },

  // Export drinks to CSV
  async exportDrinks(userId) {
    try {
      const drinks = await this.getUserDrinks(userId);
      const csvHeader = 'Drink Name,Container,Rating,Latitude,Longitude,Timestamp\n';
      const csvRows = drinks.map(drink => {
        return [
          `"${drink.drinkName}"`,
          drink.container,
          drink.rating,
          drink.location.coordinates[1],
          drink.location.coordinates[0],
          drink.timestamp
        ].join(',');
      });
      
      return csvHeader + csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting drinks:', error);
      throw error;
    }
  },

  // Quick log last drink
  async quickLogLastDrink(userId) {
    try {
      // Get last drink
      const q = query(
        collection(db, 'drinks'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return {
          success: false,
          message: 'No previous drinks found. Please log a drink first.'
        };
      }

      const lastDrink = snapshot.docs[0].data();
      
      // Get current location
      let location = lastDrink.location;
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        location = {
          coordinates: [position.coords.longitude, position.coords.latitude]
        };
      } catch (error) {
        console.warn('Using last drink location due to geolocation error:', error);
      }

      // Create new drink with current timestamp and location
      const newDrink = {
        ...lastDrink,
        timestamp: new Date(),
        location
      };

      // Add new drink
      const docRef = await addDoc(collection(db, 'drinks'), newDrink);

      return {
        success: true,
        message: '🍺 Drink logged successfully!',
        drinkId: docRef.id
      };
    } catch (error) {
      console.error('Error quick logging drink:', error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  },

  // Error message handler
  getErrorMessage(error) {
    switch (error.code) {
      case 'permission-denied':
        return 'Location access denied. Please enable location services to log drinks.';
      case 'position-unavailable':
        return 'Unable to get current location. Using last known location.';
      case 'timeout':
        return 'Location request timed out. Please try again.';
      case 'not-found':
        return 'No previous drinks found. Please log a drink first.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }
}; 