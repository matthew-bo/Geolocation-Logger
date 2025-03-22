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

  const getErrorMessage = (error) => {
    // Common Firebase error codes
    switch (error.code) {
      // Authentication errors
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please try logging in or use a different email.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Registration is temporarily disabled. Please try again later.';
      case 'auth/weak-password':
        return 'Please choose a stronger password. It should be at least 6 characters long.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please check your email or register.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later or reset your password.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      // Username errors
      case 'username/already-taken':
        return 'This username is already taken. Please choose another one.';
      // Default error
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const register = async ({ email, password, firstName, lastName, username }) => {
    try {
      // Check if username already exists
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        throw { code: 'username/already-taken' };
      }

      // Create Firebase Auth account
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with username
      await updateProfile(firebaseUser, {
        displayName: username
      });

      // Create user document in Firestore
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

      return { 
        success: true,
        message: 'Account created successfully! Welcome to DrinkTracker!' 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: getErrorMessage(error)
      };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { 
        success: true,
        message: 'Welcome back!' 
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: getErrorMessage(error)
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