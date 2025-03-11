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
  orderBy
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
  }
}; 