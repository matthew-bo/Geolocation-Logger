import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import LogDrinkScreen from '../screens/LogDrinkScreen';
import FriendsScreen from '../screens/FriendsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FriendProfileScreen from '../screens/FriendProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.glass.background,
          borderTopColor: theme.colors.glass.border,
        },
        tabBarActiveTintColor: theme.colors.beer.amber,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        headerStyle: {
          backgroundColor: theme.colors.glass.background,
          borderBottomColor: theme.colors.glass.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontFamily: theme.fonts.medium,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Map View',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="LogDrink"
        component={LogDrinkScreen}
        options={{
          title: 'Log Drink',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="beer" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="leaderboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#121212',
        },
      }}
    >
      {user ? (
        <Stack.Screen name="MainApp" component={TabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1e1e1e',
          },
          headerTintColor: '#FFF8E1',
        }}
      />
      <Stack.Screen 
        name="FriendProfile" 
        component={FriendProfileScreen}
        options={{
          title: 'Profile',
          headerStyle: {
            backgroundColor: theme.colors.beer.dark,
          },
          headerTintColor: theme.colors.text.primary,
          headerTitleStyle: {
            fontFamily: theme.fonts.medium,
            color: theme.colors.beer.amber,
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 