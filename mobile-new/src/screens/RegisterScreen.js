import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const RegisterScreen = ({ navigation }) => {
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
    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
      });
      
      if (!result.success) {
        alert(result.message);
      }
    } catch (error) {
      alert('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title} variant="headlineLarge">Beer Peer</Text>
          <Text style={styles.subtitle} variant="titleMedium">Create Account</Text>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
            outlineColor={theme.colors.beer.amber}
            activeOutlineColor={theme.colors.beer.copper}
            textColor={theme.colors.text.primary}
          />

          <TextInput
            label="Username"
            value={formData.username}
            onChangeText={(value) => updateFormData('username', value)}
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
            outlineColor={theme.colors.beer.amber}
            activeOutlineColor={theme.colors.beer.copper}
            textColor={theme.colors.text.primary}
          />

          <TextInput
            label="First Name"
            value={formData.firstName}
            onChangeText={(value) => updateFormData('firstName', value)}
            style={styles.input}
            mode="outlined"
            outlineColor={theme.colors.beer.amber}
            activeOutlineColor={theme.colors.beer.copper}
            textColor={theme.colors.text.primary}
          />

          <TextInput
            label="Last Name"
            value={formData.lastName}
            onChangeText={(value) => updateFormData('lastName', value)}
            style={styles.input}
            mode="outlined"
            outlineColor={theme.colors.beer.amber}
            activeOutlineColor={theme.colors.beer.copper}
            textColor={theme.colors.text.primary}
          />

          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            outlineColor={theme.colors.beer.amber}
            activeOutlineColor={theme.colors.beer.copper}
            textColor={theme.colors.text.primary}
          />

          <TextInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            outlineColor={theme.colors.beer.amber}
            activeOutlineColor={theme.colors.beer.copper}
            textColor={theme.colors.text.primary}
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
            buttonColor={theme.colors.beer.amber}
            textColor={theme.colors.background.primary}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
            textColor={theme.colors.text.primary}
          >
            Already have an account? Login
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontFamily: 'Inter_800ExtraBold',
  },
  subtitle: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl * 2,
    fontFamily: 'Inter_400Regular',
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
  },
  registerButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  loginButton: {
    borderColor: theme.colors.beer.amber,
    borderRadius: theme.borderRadius.md,
  },
});

export default RegisterScreen; 