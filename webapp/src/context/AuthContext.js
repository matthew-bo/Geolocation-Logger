import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext({});

// Actions that require authentication
const protectedActions = {
  logDrink: true,
  addFriend: true,
  editProfile: true,
  removeFriend: true,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async ({ email, password, firstName, lastName, username }) => {
    try {
      // Check if username already exists
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        return {
          success: false,
          message: 'Username already taken. Please choose another one.'
        };
      }

      // Create Firebase Auth account
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with username
      await updateProfile(firebaseUser, {
        displayName: username // Use username as displayName
      });

      // Ensure Firebase Auth token is refreshed
      await firebaseUser.getIdToken(true);
      
      // Add small delay to ensure Auth is fully initialized
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create user document in Firestore
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          email,
          firstName,
          lastName,
          username,
          displayName: username,
          previousDrinks: [],
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } catch (firestoreError) {
        console.error("Firestore document creation error:", firestoreError);
        // Continue despite error - the user was created in Authentication
      }

      router.push('/');
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.message
      };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const requiresAuth = (action) => {
    return protectedActions[action] || false;
  };

  const handleProtectedAction = (action, onSuccess) => {
    if (!user && requiresAuth(action)) {
      // Store the callback URL in session storage
      if (router.pathname) {
        sessionStorage.setItem('redirectAfterLogin', router.pathname);
      }
      router.push('/login');
      return false;
    }
    if (onSuccess) {
      onSuccess();
    }
    return true;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    requiresAuth,
    handleProtectedAction,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 