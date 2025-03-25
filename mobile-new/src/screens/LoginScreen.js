import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        alert(result.message);
      }
    } catch (error) {
      alert('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title} variant="headlineLarge">Beer Peer</Text>
        <Text style={styles.subtitle} variant="titleMedium">Welcome Back!</Text>
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
          outlineColor={theme.colors.beer.amber}
          activeOutlineColor={theme.colors.beer.copper}
          textColor={theme.colors.text.primary}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          outlineColor={theme.colors.beer.amber}
          activeOutlineColor={theme.colors.beer.copper}
          textColor={theme.colors.text.primary}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginButton}
          buttonColor={theme.colors.beer.amber}
          textColor={theme.colors.background.primary}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Register')}
          style={styles.registerButton}
          textColor={theme.colors.text.primary}
        >
          Don't have an account? Sign Up
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
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
  loginButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  registerButton: {
    borderColor: theme.colors.beer.amber,
    borderRadius: theme.borderRadius.md,
  },
});

export default LoginScreen; 