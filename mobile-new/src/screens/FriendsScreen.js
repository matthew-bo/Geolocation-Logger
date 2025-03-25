import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { Text, Card, Searchbar, Button, Avatar, IconButton, Portal, Modal, ActivityIndicator, Divider, List } from 'react-native-paper';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { searchUsersWithPagination, fetchUserRelations, clearFriendsCache } from '../utils/friendsUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { debounce } from 'lodash';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FriendsScreen Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <MaterialCommunityIcons 
            name="alert-circle-outline" 
            size={48} 
            color={theme.colors.error} 
          />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button 
            mode="contained" 
            onPress={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onRetry) {
                this.props.onRetry();
              }
            }}
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

function FriendsScreenContent({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const isFriend = useCallback((userId) => {
    return friends.some(friend => friend.id === userId);
  }, [friends]);

  const fetchUserData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const relations = await fetchUserRelations(user.uid);
      setFriends(relations.friends);
      setFriendRequests(relations.friendRequests);
      setSentRequests(relations.sentRequests);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchUserData();
    return () => clearFriendsCache();
  }, [fetchUserData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    clearFriendsCache();
    await fetchUserData();
    setRefreshing(false);
  }, [fetchUserData]);

  const handleSearch = async (isNewSearch = false) => {
    if (!user?.uid || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const results = await searchUsersWithPagination(searchQuery, user.uid);
      
      setSearchResults(prev => 
        isNewSearch ? results : [...prev, ...results]
      );
      setLastVisible(null); // Reset pagination since we're not using it in the new implementation
      setHasMore(false); // Disable infinite scroll for now
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to prevent too many API calls
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.length >= 2) {
        setSearchResults([]);
        setLastVisible(null);
        setHasMore(true);
        handleSearch(true);
      } else {
        setSearchResults([]);
        setLastVisible(null);
        setHasMore(false);
      }
    }, 300),
    [handleSearch]
  );

  const handleSearchQueryChange = useCallback((query) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  // Memoize user cards to prevent unnecessary re-renders
  const renderUserCard = useCallback((userData, type) => {
    const isFriend = friends.some(friend => friend.id === userData.id);
    const hasSentRequest = sentRequests.some(request => request.id === userData.id);
    const hasReceivedRequest = friendRequests.some(request => request.id === userData.id);

    return (
      <View style={styles.cardWrapper}>
        <Card key={userData.id} style={styles.userCard}>
          <Card.Content style={styles.userCardContent}>
            <View style={styles.userInfo}>
              <Avatar.Text 
                size={40} 
                label={userData.displayName?.charAt(0).toUpperCase() || '?'} 
                backgroundColor={theme.colors.beer.amber}
              />
              <Text style={styles.userName}>{userData.displayName}</Text>
            </View>
            <View style={styles.actionButtons}>
              {type === 'search' && !isFriend && !hasSentRequest && !hasReceivedRequest && (
                <Button
                  mode="contained"
                  onPress={() => sendFriendRequest(userData.id)}
                  style={styles.actionButton}
                >
                  Add Friend
                </Button>
              )}
              {type === 'request' && (
                <View style={styles.requestButtons}>
                  <Button
                    mode="contained"
                    onPress={() => acceptFriendRequest(userData.id)}
                    style={[styles.actionButton, styles.acceptButton]}
                  >
                    Accept
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => rejectFriendRequest(userData.id)}
                    style={[styles.actionButton, styles.rejectButton]}
                  >
                    Reject
                  </Button>
                </View>
              )}
              {type === 'sent' && (
                <Button
                  mode="outlined"
                  onPress={() => cancelFriendRequest(userData.id)}
                  style={styles.actionButton}
                >
                  Cancel
                </Button>
              )}
              {type === 'friend' && (
                <IconButton
                  icon="account-remove"
                  size={24}
                  onPress={() => removeFriend(userData.id)}
                  style={styles.removeButton}
                />
              )}
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  }, [friends, friendRequests, sentRequests]);

  // Memoize filtered sections
  const sections = useMemo(() => ({
    friends: { title: 'My Friends', data: friends, type: 'friend' },
    requests: { title: 'Friend Requests', data: friendRequests, type: 'request' },
    sent: { title: 'Sent Requests', data: sentRequests, type: 'sent' }
  }), [friends, friendRequests, sentRequests]);

  const handleFriendOperation = async (operation, friendId) => {
    try {
      setError(null);
      await operation(friendId);
    } catch (error) {
      console.error('Error performing friend operation:', error);
      setError('Failed to perform operation. Please try again.');
    }
  };

  const sendFriendRequest = (friendId) => handleFriendOperation(async (id) => {
    if (!user?.uid) throw new Error('User not authenticated');

    await updateDoc(doc(db, 'users', user.uid), {
      sentRequests: arrayUnion(id)
    });

    await updateDoc(doc(db, 'users', id), {
      friendRequests: arrayUnion(user.uid)
    });

    await fetchUserData();
  }, friendId);

  const acceptFriendRequest = (friendId) => handleFriendOperation(async (id) => {
    if (!user?.uid) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', user.uid);
    const friendRef = doc(db, 'users', id);

    await updateDoc(userRef, {
      friends: arrayUnion(id),
      friendRequests: arrayRemove(id)
    });

    await updateDoc(friendRef, {
      friends: arrayUnion(user.uid),
      sentRequests: arrayRemove(user.uid)
    });

    await fetchUserData();
  }, friendId);

  const rejectFriendRequest = async (friendId) => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const friendRef = doc(db, 'users', friendId);

      // Remove the request from both users
      await updateDoc(userRef, {
        friendRequests: arrayRemove(friendId)
      });

      await updateDoc(friendRef, {
        sentRequests: arrayRemove(user.uid)
      });

      await fetchUserData();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const removeFriend = async (friendId) => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const friendRef = doc(db, 'users', friendId);

      // Remove each user from the other's friends list
      await updateDoc(userRef, {
        friends: arrayRemove(friendId)
      });

      await updateDoc(friendRef, {
        friends: arrayRemove(user.uid)
      });

      await fetchUserData();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const cancelFriendRequest = async (friendId) => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const friendRef = doc(db, 'users', friendId);

      // Remove the request from both users
      await updateDoc(userRef, {
        sentRequests: arrayRemove(friendId)
      });

      await updateDoc(friendRef, {
        friendRequests: arrayRemove(user.uid)
      });

      await fetchUserData();
    } catch (error) {
      console.error('Error canceling friend request:', error);
    }
  };

  const handleUserPress = (userId) => {
    navigation.navigate('FriendProfile', { userId });
  };

  const renderUserItem = ({ item }) => (
    <List.Item
      title={item.displayName || 'Anonymous Beer Lover'}
      description={item.username || 'No username set'}
      left={props => (
        <Avatar.Text
          {...props}
          size={40}
          label={(item.displayName?.[0] || 'A').toUpperCase()}
          style={{ backgroundColor: theme.colors.beer.amber }}
        />
      )}
      right={props => (
        isFriend(item.id) ? (
          <IconButton
            {...props}
            icon="account-check"
            iconColor={theme.colors.beer.amber}
            disabled
          />
        ) : (
          <IconButton
            {...props}
            icon="account-plus"
            iconColor={theme.colors.beer.amber}
            onPress={() => sendFriendRequest(item.id)}
          />
        )
      )}
      onPress={() => handleUserPress(item.id)}
      style={styles.userItem}
    />
  );

  const renderSearchResults = () => (
    <FlatList
      data={searchResults}
      keyExtractor={(item) => item.id}
      renderItem={renderUserItem}
      onEndReached={() => hasMore && handleSearch()}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <Searchbar
          placeholder="Search users..."
          onChangeText={handleSearchQueryChange}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.text.primary}
          placeholderTextColor={theme.colors.text.secondary}
          loading={loading}
        />
      }
      ListFooterComponent={
        loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.beer.amber} />
            <Text style={styles.loadingText}>Searching for users...</Text>
          </View>
        )
      }
      ListEmptyComponent={
        !loading && searchQuery.length >= 2 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No users found</Text>
            <Text style={styles.noResultsSubtext}>Try a different search term</Text>
          </View>
        ) : searchQuery.length < 2 ? (
          <View style={styles.searchPromptContainer}>
            <Text style={styles.searchPromptText}>
              Enter at least 2 characters to search
            </Text>
          </View>
        ) : null
      }
      contentContainerStyle={styles.listContent}
    />
  );

  const renderSection = (title, data, type) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {title.toLowerCase()} to show</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.beer.amber]}
            tintColor={theme.colors.beer.amber}
          />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
      />
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 0: // Friends
        return renderSection('My Friends', friends, 'friend');
      case 1: // Search
        return renderSearchResults();
      case 2: // Requests
        return (
          <>
            {friendRequests.length > 0 && renderSection('Friend Requests', friendRequests, 'request')}
            {sentRequests.length > 0 && renderSection('Sent Requests', sentRequests, 'sent')}
            {friendRequests.length === 0 && sentRequests.length === 0 && (
              <Text style={styles.noRequestsText}>No pending requests</Text>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="account-group" size={40} color={theme.colors.beer.amber} />
        </View>
        <Text style={styles.headerTitle}>Beer Buddies</Text>
      </View>

      <View style={styles.tabContainer}>
        <View style={styles.tabs}>
          <Button
            mode={activeTab === 0 ? 'contained' : 'text'}
            onPress={() => setActiveTab(0)}
            style={[styles.tab, activeTab === 0 && styles.activeTab]}
            labelStyle={[styles.tabLabel, activeTab === 0 && styles.activeTabLabel]}
          >
            My Friends
          </Button>
          <Button
            mode={activeTab === 1 ? 'contained' : 'text'}
            onPress={() => setActiveTab(1)}
            style={[styles.tab, activeTab === 1 && styles.activeTab]}
            labelStyle={[styles.tabLabel, activeTab === 1 && styles.activeTabLabel]}
          >
            Search
          </Button>
          <Button
            mode={activeTab === 2 ? 'contained' : 'text'}
            onPress={() => setActiveTab(2)}
            style={[styles.tab, activeTab === 2 && styles.activeTab]}
            labelStyle={[styles.tabLabel, activeTab === 2 && styles.activeTabLabel]}
          >
            {`Requests (${friendRequests.length})`}
          </Button>
        </View>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

      <Portal>
        <Modal
          visible={showSearchModal}
          onDismiss={() => setShowSearchModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Searchbar
            placeholder="Search users by username"
            onChangeText={handleSearchQueryChange}
            value={searchQuery}
            style={styles.searchBar}
          />
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderUserItem}
            ListEmptyComponent={
              searchQuery.length > 0 && !loading && (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No users found</Text>
                  <Text style={styles.emptySubtext}>Try a different search term</Text>
                </Card>
              )
            }
          />
        </Modal>

        {error && (
          <Modal
            visible={!!error}
            onDismiss={() => setError(null)}
            contentContainerStyle={styles.errorModal}
          >
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="contained" onPress={() => {
              setError(null);
              onRefresh();
            }}>
              Retry
            </Button>
          </Modal>
        )}
      </Portal>
    </SafeAreaView>
  );
}

export default function FriendsScreen({ navigation }) {
  return (
    <ErrorBoundary onRetry={() => clearFriendsCache()}>
      <FriendsScreenContent navigation={navigation} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass.border,
    backgroundColor: theme.colors.glass.background,
  },
  headerIcon: {
    backgroundColor: 'rgba(251, 192, 45, 0.1)',
    borderRadius: 40,
    padding: 12,
  },
  headerTitle: {
    fontSize: 24,
    color: theme.colors.beer.amber,
    fontFamily: theme.fonts.bold,
    marginTop: 8,
  },
  tabContainer: {
    backgroundColor: theme.colors.glass.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass.border,
    zIndex: 1,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    borderRadius: 0,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.beer.amber,
  },
  tabLabel: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontFamily: theme.fonts.medium,
  },
  activeTabLabel: {
    color: theme.colors.beer.amber,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 8,
    overflow: 'visible',
  },
  userCard: {
    backgroundColor: theme.colors.glass.background,
    borderColor: theme.colors.glass.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    elevation: Platform.OS === 'android' ? 2 : 0,
    shadowColor: theme.colors.beer.amber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: theme.colors.beer.amber,
    marginRight: 12,
  },
  userName: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontFamily: theme.fonts.medium,
  },
  actionButton: {
    margin: 0,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  rejectButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  searchBar: {
    margin: 16,
    backgroundColor: theme.colors.glass.background,
    borderColor: theme.colors.glass.border,
    borderWidth: 1,
  },
  searchInput: {
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text.primary,
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.beer.amber,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: theme.colors.text.primary,
    fontSize: 18,
    marginBottom: 8,
  },
  noResultsSubtext: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  searchPromptContainer: {
    padding: 20,
    alignItems: 'center',
  },
  searchPromptText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    padding: 16,
    margin: 16,
    borderRadius: 8,
    maxHeight: '80%',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: theme.colors.glass.background,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  emptyText: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontFamily: theme.fonts.medium,
    marginBottom: 8,
  },
  emptySubtext: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
  errorModal: {
    backgroundColor: theme.colors.background.primary,
    padding: 24,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.beer.light,
    marginBottom: 12,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background.primary,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
  userItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
}); 