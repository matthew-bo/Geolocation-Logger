import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Avatar, Card, Text, Title, Paragraph, ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { fetchUserRelations } from '../utils/friendsUtils';

export default function FriendProfileScreen() {
  const { user } = useAuth();
  const route = useRoute();
  const { userId: profileUserId } = route.params;
  const [userData, setUserData] = useState(null);
  const [relationStatus, setRelationStatus] = useState('none'); // 'none', 'friend', 'sent', 'received'
  const [stats, setStats] = useState({
    totalDrinks: 0,
    uniqueBeers: 0,
    favoriteBeer: null,
    totalOunces: 0,
  });
  const [recentDrinks, setRecentDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationStats, setLocationStats] = useState({
    cities: [],
    states: [],
    countries: [],
  });
  const [showLocationDetails, setShowLocationDetails] = useState(false);

  useEffect(() => {
    if (profileUserId && user?.uid) {
      fetchUserData();
      checkFriendStatus();
    }
  }, [profileUserId, user?.uid]);

  const fetchUserData = async () => {
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchUserStats(),
        fetchRecentDrinks(),
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    const userDoc = await getDoc(doc(db, 'users', profileUserId));
    if (userDoc.exists()) {
      setUserData(userDoc.data());
    }
  };

  const fetchUserStats = async () => {
    const drinksQuery = query(
      collection(db, 'drinks'),
      where('userId', '==', profileUserId)
    );
    const snapshot = await getDocs(drinksQuery);
    const drinks = snapshot.docs.map(doc => doc.data());

    // Calculate stats
    const totalDrinks = drinks.length;
    const uniqueBeers = new Set(drinks.map(d => d.brand)).size;
    const totalOunces = drinks.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Find favorite beer
    const beerCounts = drinks.reduce((acc, d) => {
      acc[d.brand] = (acc[d.brand] || 0) + 1;
      return acc;
    }, {});
    const favoriteBeer = Object.entries(beerCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    // Location stats
    const cities = new Set();
    const states = new Set();
    const countries = new Set();

    drinks.forEach(drink => {
      if (drink.placeInfo) {
        if (drink.placeInfo.city) cities.add(drink.placeInfo.city);
        if (drink.placeInfo.state) states.add(drink.placeInfo.state);
        if (drink.placeInfo.country) countries.add(drink.placeInfo.country);
      }
    });

    setLocationStats({
      cities: Array.from(cities).sort(),
      states: Array.from(states).sort(),
      countries: Array.from(countries).sort(),
    });

    setStats({ totalDrinks, uniqueBeers, favoriteBeer, totalOunces });
  };

  const fetchRecentDrinks = async () => {
    const drinksQuery = query(
      collection(db, 'drinks'),
      where('userId', '==', profileUserId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(drinksQuery);
    const drinks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
    setRecentDrinks(drinks);
  };

  const checkFriendStatus = async () => {
    try {
      const relations = await fetchUserRelations(user.uid);
      if (relations.friends.some(friend => friend.id === profileUserId)) {
        setRelationStatus('friend');
      } else if (relations.sentRequests.some(request => request.id === profileUserId)) {
        setRelationStatus('sent');
      } else if (relations.friendRequests.some(request => request.id === profileUserId)) {
        setRelationStatus('received');
      } else {
        setRelationStatus('none');
      }
    } catch (error) {
      console.error('Error checking friend status:', error);
    }
  };

  const handleAddFriend = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        sentRequests: arrayUnion(profileUserId)
      });
      await updateDoc(doc(db, 'users', profileUserId), {
        friendRequests: arrayUnion(user.uid)
      });
      setRelationStatus('sent');
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        friends: arrayRemove(profileUserId)
      });
      await updateDoc(doc(db, 'users', profileUserId), {
        friends: arrayRemove(user.uid)
      });
      setRelationStatus('none');
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const friendRef = doc(db, 'users', profileUserId);

      await updateDoc(userRef, {
        friends: arrayUnion(profileUserId),
        friendRequests: arrayRemove(profileUserId)
      });

      await updateDoc(friendRef, {
        friends: arrayUnion(user.uid),
        sentRequests: arrayRemove(user.uid)
      });

      setRelationStatus('friend');
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleCancelRequest = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        sentRequests: arrayRemove(profileUserId)
      });
      await updateDoc(doc(db, 'users', profileUserId), {
        friendRequests: arrayRemove(user.uid)
      });
      setRelationStatus('none');
    } catch (error) {
      console.error('Error canceling friend request:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F4A460" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchUserData}>
          Retry
        </Button>
      </View>
    );
  }

  // Prepare data for the drink chart
  const chartData = {
    labels: recentDrinks.slice(-7).map(d => 
      new Date(d.timestamp).toLocaleDateString('en-US', { weekday: 'short' })
    ),
    datasets: [{
      data: recentDrinks.slice(-7).map(d => d.amount || 0)
    }]
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Avatar.Text
            size={80}
            label={userData?.username?.[0]?.toUpperCase() || 'A'}
            style={styles.avatar}
          />
          <Title style={styles.username}>
            {userData?.username || 'Anonymous Beer Lover'}
          </Title>
          <Paragraph style={styles.memberSince}>
            Member since {formatDate(userData?.createdAt)}
          </Paragraph>
          
          {/* Friend Status Buttons */}
          {user?.uid !== profileUserId && (
            <View style={styles.friendActionContainer}>
              {relationStatus === 'none' && (
                <Button
                  mode="contained"
                  onPress={handleAddFriend}
                  style={styles.friendButton}
                  icon="account-plus"
                >
                  Add Friend
                </Button>
              )}
              {relationStatus === 'friend' && (
                <Button
                  mode="outlined"
                  onPress={handleRemoveFriend}
                  style={styles.friendButton}
                  icon="account-remove"
                >
                  Remove Friend
                </Button>
              )}
              {relationStatus === 'sent' && (
                <Button
                  mode="outlined"
                  onPress={handleCancelRequest}
                  style={styles.friendButton}
                  icon="account-clock"
                >
                  Cancel Request
                </Button>
              )}
              {relationStatus === 'received' && (
                <View style={styles.requestButtons}>
                  <Button
                    mode="contained"
                    onPress={handleAcceptRequest}
                    style={[styles.friendButton, styles.acceptButton]}
                    icon="account-check"
                  >
                    Accept
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={handleCancelRequest}
                    style={[styles.friendButton, styles.rejectButton]}
                    icon="account-remove"
                  >
                    Reject
                  </Button>
                </View>
              )}
            </View>
          )}
        </View>
      </Card>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {[
          { icon: 'beer', label: 'Total Drinks', value: stats.totalDrinks },
          { icon: 'beer-outline', label: 'Unique Beers', value: stats.uniqueBeers },
          { icon: 'cup', label: 'Total Ounces', value: stats.totalOunces },
          { icon: 'star', label: 'Favorite Beer', value: stats.favoriteBeer || 'None yet' }
        ].map((stat, index) => (
          <Card key={index} style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name={stat.icon} size={24} color="#F4A460" />
              <Title style={styles.statValue}>{stat.value}</Title>
              <Paragraph style={styles.statLabel}>{stat.label}</Paragraph>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Location Stats */}
      <Card style={styles.locationCard}>
        <Card.Title
          title="Location Stats"
          right={(props) => (
            <IconButton
              {...props}
              icon={showLocationDetails ? 'chevron-up' : 'chevron-down'}
              onPress={() => setShowLocationDetails(!showLocationDetails)}
            />
          )}
        />
        <Card.Content>
          <View style={styles.locationStats}>
            <View style={styles.locationStat}>
              <MaterialCommunityIcons name="city" size={24} color="#F4A460" />
              <Title style={styles.locationValue}>{locationStats.cities.length}</Title>
              <Paragraph>Cities</Paragraph>
            </View>
            <View style={styles.locationStat}>
              <MaterialCommunityIcons name="map" size={24} color="#F4A460" />
              <Title style={styles.locationValue}>{locationStats.states.length}</Title>
              <Paragraph>States</Paragraph>
            </View>
            <View style={styles.locationStat}>
              <MaterialCommunityIcons name="earth" size={24} color="#F4A460" />
              <Title style={styles.locationValue}>{locationStats.countries.length}</Title>
              <Paragraph>Countries</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Drink Analytics */}
      <Card style={styles.chartCard}>
        <Card.Title title="Recent Drinks" />
        <Card.Content>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(244, 164, 96, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Recent Activity */}
      <Card style={styles.recentCard}>
        <Card.Title title="Recent Activity" />
        <Card.Content>
          {recentDrinks.map((drink, index) => (
            <View key={drink.id} style={[styles.drinkItem, index > 0 && styles.drinkDivider]}>
              <Title style={styles.drinkBrand}>{drink.brand || 'Unknown Brand'}</Title>
              <Paragraph style={styles.drinkDate}>
                {formatDate(drink.timestamp)}
              </Paragraph>
              {drink.placeInfo && (
                <View style={styles.locationInfo}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                  <Paragraph style={styles.locationText}>
                    {drink.placeInfo.neighborhood ? 
                      `${drink.placeInfo.neighborhood}, ${drink.placeInfo.city}` : 
                      drink.placeInfo.address || 'Unknown Location'}
                  </Paragraph>
                </View>
              )}
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    backgroundColor: '#F4A460',
  },
  username: {
    marginTop: 10,
    fontSize: 24,
  },
  memberSince: {
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '45%',
    margin: 8,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    marginTop: 8,
  },
  statLabel: {
    color: '#666',
    textAlign: 'center',
  },
  locationCard: {
    margin: 16,
    elevation: 4,
  },
  locationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  locationStat: {
    alignItems: 'center',
  },
  locationValue: {
    fontSize: 20,
    marginTop: 5,
  },
  chartCard: {
    margin: 16,
    elevation: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  recentCard: {
    margin: 16,
    elevation: 4,
  },
  drinkItem: {
    marginVertical: 8,
  },
  drinkDivider: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  drinkBrand: {
    fontSize: 16,
  },
  drinkDate: {
    color: '#666',
    fontSize: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  friendActionContainer: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  friendButton: {
    marginVertical: 8,
    minWidth: 150,
  },
  requestButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    borderColor: '#f44336',
  },
}); 