import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>
          Welcome, {user?.displayName}!
        </Text>

        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : location ? (
          <Text style={styles.text}>
            Location: {location.coords.latitude}, {location.coords.longitude}
          </Text>
        ) : (
          <Text style={styles.text}>Getting location...</Text>
        )}

        <Button
          mode="contained"
          onPress={() => {/* TODO: Implement drink logging */}}
          style={styles.button}
        >
          Log a Drink
        </Button>

        <Button
          mode="outlined"
          onPress={logout}
          style={styles.button}
        >
          Logout
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
}); 