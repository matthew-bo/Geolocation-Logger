import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const BubbleAnimation = () => {
  const bubbles = Array(5).fill().map((_, i) => ({
    animation: new Animated.Value(-100),
    delay: i * 1000,
    left: Math.random() * width,
    size: Math.random() * 30 + 20,
  }));

  bubbles.forEach(bubble => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble.animation, {
          toValue: -800,
          duration: 3000,
          delay: bubble.delay,
          useNativeDriver: true,
        }),
        Animated.timing(bubble.animation, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  });

  return bubbles.map((bubble, index) => (
    <Animated.View
      key={index}
      style={[
        styles.bubble,
        {
          left: bubble.left,
          width: bubble.size,
          height: bubble.size,
          transform: [{ translateY: bubble.animation }],
        },
      ]}
    />
  ));
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogDrink = () => {
    setLoading(true);
    navigation.navigate('LogDrink');
    setLoading(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.background}>
        <BubbleAnimation />
        <View style={styles.content}>
          <Text style={styles.title}>Beer Peer</Text>
          <Text style={styles.subtitle}>Track your beer adventures</Text>

          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleLogDrink}
            disabled={loading}
          >
            <MaterialIcons
              name="local-bar"
              size={40}
              color={theme.colors.background.primary}
            />
            <Text style={styles.buttonText}>Log a Beer</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={styles.secondaryButtonText}>View Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Friends')}
            >
              <Text style={styles.secondaryButtonText}>Friends</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    position: 'relative',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: theme.colors.beer.amber,
    borderRadius: 50,
    opacity: 0.2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    zIndex: 1,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Inter_800ExtraBold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Inter_400Regular',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl * 2,
  },
  mainButton: {
    backgroundColor: theme.colors.beer.amber,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
    marginBottom: theme.spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.beer.amber,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonText: {
    color: theme.colors.background.primary,
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  secondaryButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  secondaryButtonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
}); 