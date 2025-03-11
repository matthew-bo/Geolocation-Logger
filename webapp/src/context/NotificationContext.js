import { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    friends: 0,
    leaderboards: 0,
    map: 0,
    logDrink: 0
  });

  useEffect(() => {
    if (!user) {
      setNotifications({
        friends: 0,
        leaderboards: 0,
        map: 0,
        logDrink: 0
      });
      return;
    }

    // Subscribe to notifications
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationCounts = {
        friends: 0,
        leaderboards: 0,
        map: 0,
        logDrink: 0
      };

      snapshot.forEach((doc) => {
        const notification = doc.data();
        
        // Categorize notifications based on type
        switch (notification.type) {
          case 'friend_request':
          case 'friend_accepted':
            notificationCounts.friends++;
            break;
          case 'group_invite':
          case 'challenge_created':
          case 'group_update':
            notificationCounts.leaderboards++;
            break;
          case 'nearby_friend':
          case 'location_alert':
            notificationCounts.map++;
            break;
          case 'drink_reminder':
          case 'drink_milestone':
            notificationCounts.logDrink++;
            break;
          default:
            break;
        }
      });

      setNotifications(notificationCounts);
    });

    return () => unsubscribe();
  }, [user]);

  const value = {
    notifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
} 