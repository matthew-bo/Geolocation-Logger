import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Text, Avatar, Card, IconButton, Portal, Modal, Button, List, Divider, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { theme } from '../theme/theme';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import DrinkGraph from '../components/DrinkGraph';
import RecentActivity from '../components/RecentActivity';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalDrinks: 0,
    uniqueBeers: 0,
    favoriteBeer: null,
    totalOunces: 0,
  });
  const [userData, setUserData] = useState(null);
  const [recentDrinks, setRecentDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [locationStats, setLocationStats] = useState({
    cities: [],
    states: [],
    countries: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const paperTheme = usePaperTheme();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchUserStats(),
        fetchRecentDrinks()
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const fetchUserStats = async () => {
    try {
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(drinksQuery);
      const drinks = snapshot.docs.map(doc => doc.data());

      // Calculate basic stats
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

      // Calculate location stats
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

      setStats({
        totalDrinks,
        uniqueBeers,
        favoriteBeer,
        totalOunces,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  };

  const fetchRecentDrinks = async () => {
    try {
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', user.uid),
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
    } catch (error) {
      console.error('Error fetching recent drinks:', error);
      throw error;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error refreshing:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setRefreshing(false);
  };

  const handleDeleteDrink = useCallback(async (drinkId) => {
    Alert.alert(
      'Delete Drink',
      'Are you sure you want to delete this drink?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await deleteDoc(doc(db, 'drinks', drinkId));
              // Refresh the drinks list
              if (onRefresh) {
                onRefresh();
              }
            } catch (error) {
              console.error('Error deleting drink:', error);
              Alert.alert('Error', 'Failed to delete drink. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  }, [onRefresh]);

  const handleEditDrink = useCallback(async (updatedDrink) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const drinkRef = doc(db, 'drinks', updatedDrink.id);
      await updateDoc(drinkRef, {
        'placeInfo.name': updatedDrink.placeInfo?.name || null
      });
      // Refresh the drinks list
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating drink:', error);
      Alert.alert('Error', 'Failed to update location name. Please try again.');
    }
  }, [onRefresh]);

  const handleLocationPress = useCallback((drink) => {
    navigation.navigate('Map', { selectedDrink: drink });
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.beer.amber}
        />
      }
    >
      {/* Profile Section */}
      <View style={styles.cardWrapper}>
        <Card style={styles.profileCard}>
          <LinearGradient
            colors={[theme.colors.beer.dark, theme.colors.beer.darkWood]}
            style={styles.cardGradient}
          >
            <Card.Content style={styles.profileContent}>
              <Avatar.Text
                size={100}
                label={userData?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <Text style={styles.username}>{userData?.username || 'Anonymous Beer Lover'}</Text>
              <Text style={styles.memberSince}>Member since {formatDate(userData?.createdAt)}</Text>
            </Card.Content>
          </LinearGradient>
        </Card>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {[
          { icon: 'local-bar', value: stats.totalDrinks, label: 'Total Drinks' },
          { icon: 'star', value: stats.uniqueBeers, label: 'Unique Beers' },
          { icon: 'local-drink', value: `${stats.totalOunces}oz`, label: 'Total Volume' },
          { icon: 'favorite', value: stats.favoriteBeer || 'None', label: 'Favorite Beer' }
        ].map((stat, index) => (
          <View key={index} style={styles.statCardWrapper}>
            <Card style={styles.statCard}>
              <LinearGradient
                colors={[theme.colors.beer.dark, theme.colors.beer.darkWood]}
                style={styles.cardGradient}
              >
                <Card.Content style={styles.statContent}>
                  <MaterialIcons name={stat.icon} size={32} color={theme.colors.beer.amber} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </Card.Content>
              </LinearGradient>
            </Card>
          </View>
        ))}
      </View>

      {/* Location Stats */}
      <View style={styles.cardWrapper}>
        <Card style={styles.locationCard}>
          <LinearGradient
            colors={[theme.colors.beer.dark, theme.colors.beer.darkWood]}
            style={styles.cardGradient}
          >
            <Card.Content>
              <View style={styles.locationHeader}>
                <Text style={styles.sectionTitle}>Location Stats</Text>
                <IconButton
                  icon={showLocationDetails ? 'chevron-up' : 'chevron-down'}
                  iconColor={theme.colors.beer.amber}
                  size={24}
                  onPress={() => setShowLocationDetails(!showLocationDetails)}
                />
              </View>

              <View style={styles.locationStatsGrid}>
                <View style={styles.locationStat}>
                  <MaterialIcons name="location-city" size={32} color={theme.colors.beer.amber} />
                  <Text style={styles.locationValue}>{locationStats.cities.length}</Text>
                  <Text style={styles.locationLabel}>Cities</Text>
                </View>
                <View style={styles.locationStat}>
                  <MaterialIcons name="apartment" size={32} color={theme.colors.beer.amber} />
                  <Text style={styles.locationValue}>{locationStats.states.length}</Text>
                  <Text style={styles.locationLabel}>States</Text>
                </View>
                <View style={styles.locationStat}>
                  <MaterialIcons name="public" size={32} color={theme.colors.beer.amber} />
                  <Text style={styles.locationValue}>{locationStats.countries.length}</Text>
                  <Text style={styles.locationLabel}>Countries</Text>
                </View>
              </View>

              {showLocationDetails && (
                <View style={styles.locationDetails}>
                  <Divider style={styles.divider} />
                  <View style={styles.locationLists}>
                    <View style={styles.locationList}>
                      <Text style={styles.listTitle}>Cities</Text>
                      {locationStats.cities.map((city) => (
                        <Text key={city} style={styles.listItem}>{city}</Text>
                      ))}
                    </View>
                    <View style={styles.locationList}>
                      <Text style={styles.listTitle}>States</Text>
                      {locationStats.states.map((state) => (
                        <Text key={state} style={styles.listItem}>{state}</Text>
                      ))}
                    </View>
                    <View style={styles.locationList}>
                      <Text style={styles.listTitle}>Countries</Text>
                      {locationStats.countries.map((country) => (
                        <Text key={country} style={styles.listItem}>{country}</Text>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </Card.Content>
          </LinearGradient>
        </Card>
      </View>

      {/* Drink Analytics */}
      <DrinkGraph drinks={recentDrinks} />

      {/* Recent Activity */}
      <RecentActivity 
        drinks={recentDrinks}
        onDelete={handleDeleteDrink}
        onEdit={handleEditDrink}
        onLocationPress={handleLocationPress}
      />

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor={theme.colors.beer.copper}
      >
        Log Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  cardWrapper: {
    margin: 8,
    borderRadius: theme.borderRadius.lg,
    elevation: 4,
    shadowColor: theme.colors.beer.amber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileCard: {
    backgroundColor: theme.colors.beer.dark,
    borderColor: theme.colors.beer.amber,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
  },
  cardGradient: {
    borderRadius: theme.borderRadius.lg,
  },
  profileContent: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    backgroundColor: theme.colors.beer.amber,
    marginBottom: 16,
  },
  avatarLabel: {
    fontSize: 40,
    color: theme.colors.beer.darkWood,
  },
  username: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  statCardWrapper: {
    width: '48%',
    marginBottom: 8,
  },
  statCard: {
    backgroundColor: theme.colors.beer.dark,
    borderColor: theme.colors.beer.amber,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text.primary,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text.secondary,
  },
  locationCard: {
    backgroundColor: theme.colors.beer.dark,
    borderColor: theme.colors.beer.amber,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.beer.amber,
  },
  locationStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  locationStat: {
    alignItems: 'center',
  },
  locationValue: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text.primary,
    marginVertical: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text.secondary,
  },
  locationDetails: {
    marginTop: 16,
  },
  divider: {
    backgroundColor: theme.colors.glass.border,
    marginVertical: 16,
  },
  locationLists: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationList: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.beer.amber,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  logoutButton: {
    margin: 16,
    marginTop: 24,
  },
}); 