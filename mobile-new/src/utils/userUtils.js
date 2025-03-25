import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const initializeUserData = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    const displayName = userData.displayName || userData.firstName || 'Anonymous Beer Lover';
    const now = new Date().toISOString();

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, {
        displayName,
        displayNameLower: displayName.toLowerCase(),
        email: userData.email || '',
        username: userData.username || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        friends: [],
        friendRequests: [],
        sentRequests: [],
        previousDrinks: [],
        createdAt: now,
        lastLogin: now,
        updatedAt: now
      });
    } else {
      // Update existing user document with missing fields
      const currentData = userDoc.data();
      await updateDoc(userRef, {
        displayName: currentData.displayName || displayName,
        displayNameLower: (currentData.displayName || displayName).toLowerCase(),
        friends: currentData.friends || [],
        friendRequests: currentData.friendRequests || [],
        sentRequests: currentData.sentRequests || [],
        updatedAt: now,
        lastLogin: now
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing user data:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    if (!userId || !userData) {
      console.error('Invalid parameters for updateUserProfile:', { userId, userData });
      throw new Error('Invalid parameters for profile update');
    }

    const userRef = doc(db, 'users', userId);
    const displayName = userData.displayName || userData.firstName || 'Anonymous Beer Lover';
    
    const updatedData = {
      ...userData,
      displayName,
      displayNameLower: displayName.toLowerCase(),
      updatedAt: new Date().toISOString()
    };

    await updateDoc(userRef, updatedData);
    console.log('User profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (userId, userData) => {
  try {
    if (!userId || !userData) {
      console.error('Invalid parameters for createUserProfile:', { userId, userData });
      throw new Error('Invalid parameters for profile creation');
    }

    const userRef = doc(db, 'users', userId);
    const displayName = userData.displayName?.trim() || '';
    
    const userProfile = {
      displayName,
      displayNameLower: displayName.toLowerCase(),
      email: userData.email || '',
      username: userData.username || '',
      friends: [],
      friendRequests: [],
      sentRequests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData
    };

    await setDoc(userRef, userProfile);
    console.log('User profile created successfully');
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Function to fix existing user data
export const migrateUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log('User document not found for migration');
      return false;
    }

    const userData = userDoc.data();
    const displayName = userData.displayName || userData.firstName || 'Anonymous Beer Lover';
    const now = new Date().toISOString();

    const updatedData = {
      displayName,
      displayNameLower: displayName.toLowerCase(),
      friends: userData.friends || [],
      friendRequests: userData.friendRequests || [],
      sentRequests: userData.sentRequests || [],
      previousDrinks: userData.previousDrinks || [],
      email: userData.email || '',
      username: userData.username || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      updatedAt: now,
      lastLogin: now
    };

    await updateDoc(userRef, updatedData);
    console.log('User data migrated successfully');
    return true;
  } catch (error) {
    console.error('Error migrating user data:', error);
    throw error;
  }
};

// Function to migrate all users
export const migrateAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const migrations = snapshot.docs.map(doc => 
      migrateUserData(doc.id)
    );

    await Promise.all(migrations);
    console.log('All users migrated successfully');
    return true;
  } catch (error) {
    console.error('Error migrating all users:', error);
    throw error;
  }
}; 