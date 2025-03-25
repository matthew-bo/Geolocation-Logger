import { collection, query, where, getDocs, doc, getDoc, startAfter, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

const USERS_PER_PAGE = 20;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

class FriendsCache {
  constructor() {
    this.cache = new Map();
    this.lastCleanup = Date.now();
  }

  set(key, value) {
    this.cleanup();
    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  get(key) {
    this.cleanup();
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > CACHE_EXPIRY) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  cleanup() {
    if (Date.now() - this.lastCleanup < CACHE_EXPIRY) return;
    
    for (const [key, value] of this.cache.entries()) {
      if (Date.now() - value.timestamp > CACHE_EXPIRY) {
        this.cache.delete(key);
      }
    }
    this.lastCleanup = Date.now();
  }

  clear() {
    this.cache.clear();
  }
}

const friendsCache = new FriendsCache();

const getFriendRelations = async (userId) => {
  try {
    // Query the friendships collection instead of user document
    const friendshipsQuery = query(collection(db, 'friendships'), 
      where('users', 'array-contains', userId));
    const friendRequestsQuery = query(collection(db, 'friendRequests'), 
      where('receiverId', '==', userId));
    const sentRequestsQuery = query(collection(db, 'friendRequests'), 
      where('senderId', '==', userId));

    // Get all relationships
    const [friendships, requests, sent] = await Promise.all([
      getDocs(friendshipsQuery),
      getDocs(friendRequestsQuery),
      getDocs(sentRequestsQuery)
    ]);

    return {
      friends: friendships.docs.map(doc => doc.data().users.find(id => id !== userId)),
      requests: requests.docs.map(doc => doc.data().senderId),
      sent: sent.docs.map(doc => doc.data().receiverId)
    };
  } catch (error) {
    console.error('Error fetching friend relations:', error);
    return { friends: [], requests: [], sent: [] };
  }
};

export const searchUsersWithPagination = async (searchQuery, currentUserId) => {
  try {
    if (!searchQuery?.trim() || !currentUserId) {
      console.log('Invalid search parameters:', { searchQuery, currentUserId });
      return [];
    }

    const trimmedQuery = searchQuery.trim().toLowerCase();
    console.log('Starting search with query:', trimmedQuery);
    
    const usersRef = collection(db, 'users');
    let results = [];

    // Search by displayName
    const displayNameQuery = query(usersRef, 
      where('displayName', '>=', trimmedQuery),
      where('displayName', '<=', trimmedQuery + '\uf8ff'),
      limit(10));
    
    const displayNameSnapshot = await getDocs(displayNameQuery);
    console.log('DisplayName search returned:', displayNameSnapshot.size, 'results');
    
    if (displayNameSnapshot.empty) {
      // Try email search
      const emailQuery = query(usersRef,
        where('email', '>=', trimmedQuery),
        where('email', '<=', trimmedQuery + '\uf8ff'),
        limit(10));
      
      const emailSnapshot = await getDocs(emailQuery);
      console.log('Email search returned:', emailSnapshot.size, 'results');
      
      if (emailSnapshot.empty) {
        // Try username search
        const usernameQuery = query(usersRef,
          where('username', '>=', trimmedQuery),
          where('username', '<=', trimmedQuery + '\uf8ff'),
          limit(10));
        
        const usernameSnapshot = await getDocs(usernameQuery);
        console.log('Username search returned:', usernameSnapshot.size, 'results');
        results = usernameSnapshot.docs;
      } else {
        results = emailSnapshot.docs;
      }
    } else {
      results = displayNameSnapshot.docs;
    }

    // Process results
    const processedUsers = await Promise.all(results
      .filter(doc => doc.id !== currentUserId)
      .map(async doc => {
        const data = doc.data();
        console.log('Processing user document:', {
          id: doc.id,
          hasDisplayName: !!data.displayName,
          hasUsername: !!data.username,
          hasEmail: !!data.email
        });

        // Check friendship status using both user1 and user2 queries
        const friendshipQuery1 = query(collection(db, 'friendships'),
          where('user1', '==', currentUserId),
          where('user2', '==', doc.id));
        const friendshipQuery2 = query(collection(db, 'friendships'),
          where('user1', '==', doc.id),
          where('user2', '==', currentUserId));
        
        const [friendships1, friendships2] = await Promise.all([
          getDocs(friendshipQuery1),
          getDocs(friendshipQuery2)
        ]);
        
        const isFriend = !friendships1.empty || !friendships2.empty;
        
        return {
          id: doc.id,
          displayName: data.displayName || data.username || data.email?.split('@')[0] || 'Anonymous User',
          email: data.email || '',
          username: data.username || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          isFriend
        };
      }));

    console.log('Final processed users:', processedUsers.length);
    return processedUsers;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

const processUser = (doc) => {
  const data = doc.data();
  console.log('Processing user data:', {
    id: doc.id,
    hasDisplayName: !!data.displayName,
    hasUsername: !!data.username,
    hasEmail: !!data.email
  });
  
  // Accept any user that has at least an ID and one identifier
  if (data.displayName || data.username || data.email) {
    return {
      id: doc.id,
      displayName: data.displayName || data.username || data.email.split('@')[0],
      email: data.email,
      username: data.username
    };
  }
  console.log('User rejected - missing required fields');
  return null;
};

export const fetchUserRelations = async (userId) => {
  if (!userId) {
    console.log('No userId provided to fetchUserRelations');
    return { friends: [], friendRequests: [], sentRequests: [] };
  }

  try {
    console.log('Fetching user relations for:', userId);
    
    // Query friendships collection for both user1 and user2
    const friendshipsQuery1 = query(collection(db, 'friendships'), 
      where('user1', '==', userId));
    const friendshipsQuery2 = query(collection(db, 'friendships'), 
      where('user2', '==', userId));
    
    const [friendships1, friendships2] = await Promise.all([
      getDocs(friendshipsQuery1),
      getDocs(friendshipsQuery2)
    ]);

    // Get friend IDs from both queries
    const friendIds = new Set([
      ...friendships1.docs.map(doc => doc.data().user2),
      ...friendships2.docs.map(doc => doc.data().user1)
    ]);

    console.log('Found friend IDs:', Array.from(friendIds));

    // Fetch friend user documents
    const friends = [];
    if (friendIds.size > 0) {
      const friendsQuery = query(collection(db, 'users'), 
        where('__name__', 'in', Array.from(friendIds)));
      const friendsSnapshot = await getDocs(friendsQuery);
      
      friendsSnapshot.forEach(doc => {
        const data = doc.data();
        friends.push({
          id: doc.id,
          displayName: data.displayName || data.username || data.email?.split('@')[0] || 'Anonymous User',
          email: data.email || '',
          username: data.username || ''
        });
      });
    }

    // Get friend requests
    const requestsQuery = query(collection(db, 'friendRequests'),
      where('receiverId', '==', userId));
    const sentRequestsQuery = query(collection(db, 'friendRequests'),
      where('senderId', '==', userId));
    
    const [requests, sent] = await Promise.all([
      getDocs(requestsQuery),
      getDocs(sentRequestsQuery)
    ]);

    // Process requests
    const friendRequests = await Promise.all(requests.docs.map(async doc => {
      const data = doc.data();
      const userDoc = await getDoc(doc(db, 'users', data.senderId));
      const userData = userDoc.data();
      return {
        id: data.senderId,
        displayName: userData.displayName || userData.username || userData.email?.split('@')[0] || 'Anonymous User',
        email: userData.email || '',
        username: userData.username || ''
      };
    }));

    // Process sent requests
    const sentRequests = await Promise.all(sent.docs.map(async doc => {
      const data = doc.data();
      const userDoc = await getDoc(doc(db, 'users', data.receiverId));
      const userData = userDoc.data();
      return {
        id: data.receiverId,
        displayName: userData.displayName || userData.username || userData.email?.split('@')[0] || 'Anonymous User',
        email: userData.email || '',
        username: userData.username || ''
      };
    }));

    console.log('Fetched relations:', {
      friends: friends.length,
      requests: friendRequests.length,
      sent: sentRequests.length
    });

    return { friends, friendRequests, sentRequests };
  } catch (error) {
    console.error('Error fetching user relations:', error);
    return { friends: [], friendRequests: [], sentRequests: [] };
  }
};

export const clearFriendsCache = () => {
  friendsCache.clear();
};

const getFriendshipStatus = async (userId, otherUserId) => {
  try {
    // Check both directions of friendship
    const friendshipQuery1 = query(collection(db, 'friendships'),
      where('user1', '==', userId),
      where('user2', '==', otherUserId));
    const friendshipQuery2 = query(collection(db, 'friendships'),
      where('user1', '==', otherUserId),
      where('user2', '==', userId));
    
    const [friendship1, friendship2] = await Promise.all([
      getDocs(friendshipQuery1),
      getDocs(friendshipQuery2)
    ]);

    if (!friendship1.empty || !friendship2.empty) {
      return 'friends';
    }

    // Check friend requests
    const requestQuery = query(collection(db, 'friendRequests'),
      where('senderId', '==', otherUserId),
      where('receiverId', '==', userId));
    const sentRequestQuery = query(collection(db, 'friendRequests'),
      where('senderId', '==', userId),
      where('receiverId', '==', otherUserId));

    const [request, sentRequest] = await Promise.all([
      getDocs(requestQuery),
      getDocs(sentRequestQuery)
    ]);

    if (!request.empty) return 'pending';
    if (!sentRequest.empty) return 'sent';
    return 'none';
  } catch (error) {
    console.error('Error checking friendship status:', error);
    return 'none';
  }
}; 