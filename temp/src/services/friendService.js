import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  deleteDoc,
  serverTimestamp,
  or
} from 'firebase/firestore';

class FriendService {
  // Search for users by username
  async searchUsers(searchTerm, currentUserId) {
    const usersRef = collection(db, 'users');
    const searchTermLower = searchTerm.toLowerCase();
    
    // Get all users
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get current user's friends and pending requests
    const [friends, pendingRequests] = await Promise.all([
      this.getFriends(currentUserId),
      this.getPendingRequests(currentUserId)
    ]);
    
    const friendIds = new Set(friends.map(f => f.id));
    const pendingRequestIds = new Set(pendingRequests.map(r => r.senderId));
    
    // Filter users
    return users.filter(user => {
      // Exclude current user
      if (user.id === currentUserId) return false;
      
      // Exclude existing friends
      if (friendIds.has(user.id)) return false;
      
      // Exclude users with pending requests (but not rejected ones)
      if (pendingRequestIds.has(user.id)) return false;
      
      // Search by username or display name only
      return (
        user.username?.toLowerCase().includes(searchTermLower) ||
        user.displayName?.toLowerCase().includes(searchTermLower) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTermLower)
      );
    });
  }

  // Send friend request
  async sendFriendRequest(senderId, receiverId) {
    // Check if they're already friends
    const areFriends = await this.areFriends(senderId, receiverId);
    if (areFriends) {
      throw new Error('Users are already friends');
    }

    // Check for existing requests
    const existingRequest = await this.getExistingRequest(senderId, receiverId);
    if (existingRequest) {
      throw new Error('A friend request already exists between these users');
    }

    const requestId = `${senderId}_${receiverId}`;
    
    // Get sender's user data to include their info
    const senderDoc = await getDoc(doc(db, 'users', senderId));
    const senderData = senderDoc.data();
    
    await setDoc(doc(db, 'friendRequests', requestId), {
      senderId,
      receiverId,
      senderUsername: senderData.username || senderData.displayName || '',
      senderPhotoURL: senderData.photoURL || '',
      status: 'pending',
      createdAt: serverTimestamp()
    });
  }

  // Accept friend request
  async acceptFriendRequest(requestId) {
    const requestRef = doc(db, 'friendRequests', requestId);
    const request = await getDoc(requestRef);
    
    if (!request.exists()) {
      throw new Error('Friend request not found');
    }

    const { senderId, receiverId } = request.data();
    const friendshipId = `${senderId}_${receiverId}`;
    
    // Create friendship document
    await setDoc(doc(db, 'friendships', friendshipId), {
      user1: senderId,
      user2: receiverId,
      createdAt: serverTimestamp()
    });

    // Delete the request
    await deleteDoc(requestRef);
  }

  // Reject friend request
  async rejectFriendRequest(requestId) {
    await deleteDoc(doc(db, 'friendRequests', requestId));
  }

  // Get pending friend requests
  async getPendingRequests(userId) {
    try {
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('receiverId', '==', userId),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(requestsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return [];
    }
  }

  // Get user's friends
  async getFriends(userId) {
    const friendshipsRef = collection(db, 'friendships');
    const q = query(friendshipsRef, 
      or(
        where('user1', '==', userId),
        where('user2', '==', userId)
      )
    );
    
    const snapshot = await getDocs(q);
    const friendships = snapshot.docs.map(doc => doc.data());
    
    const friendIds = friendships.map(f => f.user1 === userId ? f.user2 : f.user1);
    const friendPromises = friendIds.map(id => getDoc(doc(db, 'users', id)));
    const friendDocs = await Promise.all(friendPromises);
    
    return friendDocs
      .filter(doc => doc.exists())
      .map(doc => ({ 
        id: doc.id,
        ...doc.data(),
        isFriend: true
      }));
  }

  // Remove friend
  async removeFriend(userId1, userId2) {
    const friendshipId1 = `${userId1}_${userId2}`;
    const friendshipId2 = `${userId2}_${userId1}`;
    
    try {
      await deleteDoc(doc(db, 'friendships', friendshipId1));
    } catch (error) {
      await deleteDoc(doc(db, 'friendships', friendshipId2));
    }
  }

  // Check if users are friends
  async areFriends(userId1, userId2) {
    try {
      const friendshipId1 = `${userId1}_${userId2}`;
      const friendshipId2 = `${userId2}_${userId1}`;
      
      const [doc1, doc2] = await Promise.all([
        getDoc(doc(db, 'friendships', friendshipId1)),
        getDoc(doc(db, 'friendships', friendshipId2))
      ]);
      
      return doc1.exists() || doc2.exists();
    } catch (error) {
      console.error('Error checking friendship status:', error);
      return false;
    }
  }

  // Get sent friend requests
  async getSentRequests(userId) {
    try {
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('senderId', '==', userId),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(requestsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting sent requests:', error);
      return [];
    }
  }

  // Get existing request between two users (if any)
  async getExistingRequest(userId1, userId2) {
    const requestsRef = collection(db, 'friendRequests');
    const q1 = query(requestsRef, 
      where('senderId', '==', userId1),
      where('receiverId', '==', userId2),
      where('status', '==', 'pending')
    );
    const q2 = query(requestsRef,
      where('senderId', '==', userId2),
      where('receiverId', '==', userId1),
      where('status', '==', 'pending')
    );

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const requests = [...snap1.docs, ...snap2.docs];
    
    return requests.length > 0 ? { id: requests[0].id, ...requests[0].data() } : null;
  }
}

export const friendService = new FriendService(); 