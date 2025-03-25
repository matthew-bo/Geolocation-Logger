import React, { createContext, useContext, useState, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const DrinkContext = createContext();

export function DrinkProvider({ children }) {
  const { user } = useAuth();
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDrinks = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching drinks for user:', user.uid);
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(drinksQuery);
      const drinksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
      }));
      console.log('Fetched drinks:', drinksData.length);
      setDrinks(drinksData);
    } catch (error) {
      console.error('Error fetching drinks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <DrinkContext.Provider value={{ drinks, loading, fetchDrinks }}>
      {children}
    </DrinkContext.Provider>
  );
}

export function useDrinks() {
  const context = useContext(DrinkContext);
  if (!context) {
    throw new Error('useDrinks must be used within a DrinkProvider');
  }
  return context;
} 