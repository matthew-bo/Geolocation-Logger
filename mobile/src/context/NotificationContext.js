import { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';

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
    // Configure notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

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

    // Subscribe to notifications in Firestore
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
        
        // Categorize notifications and schedule local notification if needed
        switch (notification.type) {
          case 'friend_request':
          case 'friend_accepted':
            notificationCounts.friends++;
            scheduleLocalNotification(notification);
            break;
          case 'group_invite':
          case 'challenge_created':
          case 'group_update':
            notificationCounts.leaderboards++;
            scheduleLocalNotification(notification);
            break;
          case 'nearby_friend':
          case 'location_alert':
            notificationCounts.map++;
            scheduleLocalNotification(notification);
            break;
          case 'drink_reminder':
          case 'drink_milestone':
            notificationCounts.logDrink++;
            scheduleLocalNotification(notification);
            break;
          default:
            break;
        }
      });

      setNotifications(notificationCounts);
    });

    return () => unsubscribe();
  }, [user]);

  const scheduleLocalNotification = async (notification) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: getNotificationTitle(notification),
          body: notification.message,
          data: { type: notification.type },
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const getNotificationTitle = (notification) => {
    switch (notification.type) {
      case 'friend_request':
        return 'New Friend Request';
      case 'friend_accepted':
        return 'Friend Request Accepted';
      case 'group_invite':
        return 'New Group Invitation';
      case 'challenge_created':
        return 'New Challenge';
      case 'group_update':
        return 'Group Update';
      case 'nearby_friend':
        return 'Friend Nearby';
      case 'location_alert':
        return 'Location Alert';
      case 'drink_reminder':
        return 'Drink Reminder';
      case 'drink_milestone':
        return 'Achievement Unlocked';
      default:
        return 'New Notification';
    }
  };

  const value = {
    notifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
} 