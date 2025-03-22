import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, startAfter, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { locationService } from '../services/locationService';

const ITEMS_PER_PAGE = 20;

export function useDrinks(userId, page = 1) {
  return useQuery({
    queryKey: ['drinks', userId, page],
    queryFn: async () => {
      const drinksRef = collection(db, 'drinks');
      const q = query(
        drinksRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(ITEMS_PER_PAGE),
        ...(page > 1 ? [startAfter((page - 1) * ITEMS_PER_PAGE)] : [])
      );
      
      const snapshot = await getDocs(q);
      return {
        drinks: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        lastVisible: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === ITEMS_PER_PAGE
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!userId,
  });
}

export function useFriends(userId, page = 1) {
  return useQuery({
    queryKey: ['friends', userId, page],
    queryFn: async () => {
      const friendsRef = collection(db, 'friends');
      const q = query(
        friendsRef,
        where('userId', '==', userId),
        orderBy('username'),
        limit(ITEMS_PER_PAGE),
        ...(page > 1 ? [startAfter((page - 1) * ITEMS_PER_PAGE)] : [])
      );
      
      const snapshot = await getDocs(q);
      return {
        friends: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        lastVisible: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === ITEMS_PER_PAGE
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    enabled: !!userId,
  });
}

export function useUserProfile(userId) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const userDoc = await getDocs(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      return userDoc.data();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!userId,
  });
}

export function useLocationStats(drinks) {
  return useQuery({
    queryKey: ['locationStats', drinks?.length],
    queryFn: () => locationService.getLocationStats(drinks),
    staleTime: 1000 * 60 * 15, // 15 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    enabled: !!drinks && drinks.length > 0,
  });
}

// Mutation hooks for data updates
export function useUpdateDrink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ drinkId, updates }) => {
      const drinkRef = doc(db, 'drinks', drinkId);
      await updateDoc(drinkRef, updates);
      return { id: drinkId, ...updates };
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch drinks query
      queryClient.invalidateQueries(['drinks']);
      // Update drink in cache
      queryClient.setQueryData(['drink', variables.drinkId], data);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }) => {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updates);
      return { id: userId, ...updates };
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch profile query
      queryClient.invalidateQueries(['profile', variables.userId]);
    },
  });
} 