import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { DrinkProvider } from './src/context/DrinkContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';

// Create a client
const queryClient = new QueryClient();

// Create Paper theme
const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: theme.colors.beer.amber,
    secondary: theme.colors.beer.copper,
    background: theme.colors.background.primary,
    surface: theme.colors.background.secondary,
    text: theme.colors.text.primary,
    placeholder: theme.colors.text.secondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DrinkProvider>
            <NotificationProvider>
              <PaperProvider theme={paperTheme}>
                <SafeAreaProvider>
                  <NavigationContainer
                    theme={{
                      dark: true,
                      colors: {
                        primary: theme.colors.beer.amber,
                        background: theme.colors.background.primary,
                        card: theme.colors.background.secondary,
                        text: theme.colors.text.primary,
                        border: theme.colors.glass.border,
                        notification: theme.colors.beer.copper,
                      },
                    }}
                  >
                    <StatusBar style="light" />
                    <AppNavigator />
                  </NavigationContainer>
                </SafeAreaProvider>
              </PaperProvider>
            </NotificationProvider>
          </DrinkProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
