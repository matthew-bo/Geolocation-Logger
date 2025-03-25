import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (Object.values(formData).some(value => !value)) {
      alert('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
    });
    setLoading(false);

    if (!result.success) {
      alert(result.message);
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>Create Account</Text>

        <TextInput
          label="Email"
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          label="Username"
          value={formData.username}
          onChangeText={(value) => updateFormData('username', value)}
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          label="First Name"
          value={formData.firstName}
          onChangeText={(value) => updateFormData('firstName', value)}
          style={styles.input}
        />

        <TextInput
          label="Last Name"
          value={formData.lastName}
          onChangeText={(value) => updateFormData('lastName', value)}
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={formData.password}
          onChangeText={(value) => updateFormData('password', value)}
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => updateFormData('confirmPassword', value)}
          secureTextEntry
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        >
          Register
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          Already have an account? Login
        </Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
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
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
}); 