import { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const initializeNotifications = async () => {
      try {
        if (Platform.OS === 'web') {
          console.log('Notifications are not supported on web');
          return;
        }

        // Configure notification handler first
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push notification permissions');
          return;
        }

        if (isMounted) {
          setNotificationsEnabled(true);
        }

        try {
          // Try to get the push token
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID // Use Firebase project ID instead
          });

          if (isMounted && token?.data) {
            setPushToken(token.data);
            // Update user's document with push token if we have both token and user
            if (user?.uid) {
              await updateDoc(doc(db, 'users', user.uid), {
                pushToken: token.data,
                notificationsEnabled: true,
              });
            }
          }
        } catch (tokenError) {
          console.log('Could not get push token:', tokenError);
          // Continue even if we couldn't get the token
          // The app can still function without push notifications
        }
      } catch (error) {
        console.log('Error setting up notifications:', error);
        // Don't throw the error - we want the app to continue working
        // even if notifications aren't available
      }
    };

    if (user) {
      initializeNotifications();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const value = {
    notificationsEnabled,
    pushToken,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
} 