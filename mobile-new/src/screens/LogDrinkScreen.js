import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Keyboard, Platform } from 'react-native';
import { Text, TextInput, Button, Card, IconButton, Portal, Modal, List, SegmentedButtons, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { theme } from '../theme/theme';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const CONTAINER_TYPES = [
  { label: 'Pint Glass', value: 'pint' },
  { label: 'Bottle', value: 'bottle' },
  { label: 'Can', value: 'can' },
  { label: 'Solo Cup', value: 'solo cup' },
  { label: 'Shotgun', value: 'shotgun' },
  { label: 'Funnel', value: 'funnel' },
  { label: 'Martini Glass', value: 'martini glass' },
  { label: 'Wine Glass', value: 'wine glass' },
  { label: 'Other', value: 'other' },
];

const BEER_SIZES = [
  { label: '12 oz', value: 12 },
  { label: '16 oz', value: 16 },
  { label: '22 oz', value: 22 },
  { label: '32 oz', value: 32 },
  { label: 'Other', value: 0 },
];

const LogDrinkScreen = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    brand: '',
    containerType: '',
    amount: 12,
    rating: 0,
    notes: '',
    method: '',
  });
  const [customAmount, setCustomAmount] = useState('');
  const [previousBrands, setPreviousBrands] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBrandsModal, setShowBrandsModal] = useState(false);
  const [showContainerMenu, setShowContainerMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState([]);

  useEffect(() => {
    getLocation();
    loadPreviousBrands();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      setLocationError('Error getting location');
      console.error(error);
    }
  };

  const loadPreviousBrands = async () => {
    try {
      const q = query(
        collection(db, 'drinks'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const brands = [...new Set(snapshot.docs.map(doc => doc.data().brand).filter(Boolean))];
      setPreviousBrands(brands);
    } catch (error) {
      console.error('Error loading previous brands:', error);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPreviousBrands();
      await getLocation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error refreshing:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setRefreshing(false);
  }, []);

  // Brand suggestions
  const updateBrandSuggestions = useCallback((text) => {
    if (!text) {
      setBrandSuggestions([]);
      return;
    }
    const matches = previousBrands.filter(brand => 
      brand.toLowerCase().includes(text.toLowerCase())
    );
    setBrandSuggestions(matches);
  }, [previousBrands]);

  const handleBrandChange = (value) => {
    setFormData(prev => ({ ...prev, brand: value }));
    updateBrandSuggestions(value);
  };

  const handleLogDrink = async () => {
    Keyboard.dismiss();
    
    // Validate required fields
    const errors = [];
    if (!formData.brand) errors.push('Beer Brand');
    if (!formData.containerType) errors.push('Container Type');
    if (formData.amount === 0 && !customAmount) errors.push('Amount');
    if (formData.amount === 0 && customAmount && isNaN(Number(customAmount))) errors.push('Valid Amount');

    if (errors.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert(`Please fill in the required fields:\n${errors.join('\n')}`);
      return;
    }

    setLoading(true);
    try {
      const finalAmount = formData.amount === 0 ? Number(customAmount) : formData.amount;
      
      const drinkData = {
        ...formData,
        amount: finalAmount,
        userId: user.uid,
        timestamp: serverTimestamp(),
      };

      if (location) {
        drinkData.location = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      // Add the drink
      const docRef = await addDoc(collection(db, 'drinks'), drinkData);

      // Update user's previous drinks
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        previousDrinks: [...(previousBrands || []), formData.brand],
      });

      // Reset form
      setFormData({
        brand: '',
        containerType: '',
        amount: 12,
        rating: 0,
        notes: '',
        method: '',
      });
      setCustomAmount('');
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert('Drink logged successfully! 🍺');
    } catch (error) {
      console.error('Error logging drink:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Failed to log drink. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IconButton
          key={i}
          icon={i <= formData.rating ? 'star' : 'star-outline'}
          iconColor={theme.colors.beer.amber}
          size={32}
          onPress={() => setFormData(prev => ({ ...prev, rating: i }))}
        />
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[
            theme.colors.beer.gradient.start,
            theme.colors.beer.gradient.middle,
            theme.colors.beer.gradient.end
          ]}
          locations={[0.1, 0.4, 0.9]}
          style={styles.gradient}
        >
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.beer.amber}
              />
            }
            enableOnAndroid
            extraScrollHeight={20}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerContainer}>
              <IconButton
                icon="beer"
                size={40}
                iconColor={theme.colors.beer.amber}
                style={styles.headerIcon}
              />
              <Text style={styles.title}>Log Your Beer</Text>
            </View>

            <Card style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)', 'transparent']}
                locations={[0, 0.3, 1]}
                style={styles.cardGradient}
              >
                <Card.Content style={styles.cardContent}>
                  {/* Brand Input with Suggestions */}
                  <View>
                    <View style={styles.fieldHeader}>
                      <Text style={styles.sectionTitle}>Beer Brand</Text>
                      <Text style={styles.requiredIndicator}>*</Text>
                    </View>
                    <TextInput
                      value={formData.brand}
                      onChangeText={handleBrandChange}
                      right={
                        <TextInput.Icon
                          icon="history"
                          onPress={() => {
                            Haptics.selectionAsync();
                            setShowBrandsModal(true);
                          }}
                          color={theme.colors.beer.amber}
                        />
                      }
                      style={styles.input}
                      mode="outlined"
                      outlineColor={theme.colors.glass.border}
                      activeOutlineColor={theme.colors.beer.amber}
                      textColor={theme.colors.text.input}
                      autoCapitalize="words"
                      theme={{
                        colors: {
                          onSurfaceVariant: theme.colors.text.label,
                          background: theme.colors.glass.background,
                        },
                      }}
                    />
                    {brandSuggestions.length > 0 && (
                      <Card style={styles.suggestionsCard}>
                        {brandSuggestions.map((suggestion) => (
                          <List.Item
                            key={suggestion}
                            title={suggestion}
                            onPress={() => {
                              Haptics.selectionAsync();
                              setFormData(prev => ({ ...prev, brand: suggestion }));
                              setBrandSuggestions([]);
                            }}
                            titleStyle={styles.suggestionText}
                          />
                        ))}
                      </Card>
                    )}
                  </View>

                  {/* Container Type */}
                  <View>
                    <View style={styles.fieldHeader}>
                      <Text style={styles.sectionTitle}>Container</Text>
                      <Text style={styles.requiredIndicator}>*</Text>
                    </View>
                    <Menu
                      visible={showContainerMenu}
                      onDismiss={() => setShowContainerMenu(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setShowContainerMenu(true)}
                          style={[
                            styles.dropdownButton,
                            formData.containerType && styles.dropdownButtonSelected
                          ]}
                          textColor={formData.containerType ? theme.colors.beer.amber : theme.colors.text.input}
                          icon={formData.containerType ? "check" : "chevron-down"}
                        >
                          {formData.containerType 
                            ? CONTAINER_TYPES.find(t => t.value === formData.containerType)?.label 
                            : "Select Container Type"}
                        </Button>
                      }
                      contentStyle={styles.containerMenu}
                    >
                      {CONTAINER_TYPES.map((type) => (
                        <Menu.Item
                          key={type.value}
                          onPress={() => {
                            setFormData(prev => ({ ...prev, containerType: type.value }));
                            setShowContainerMenu(false);
                          }}
                          title={type.label}
                          titleStyle={styles.menuItemText}
                        />
                      ))}
                    </Menu>
                  </View>

                  {/* Amount */}
                  <View>
                    <View style={styles.fieldHeader}>
                      <Text style={[styles.sectionTitle, { marginTop: theme.spacing.md }]}>Amount</Text>
                      <Text style={styles.requiredIndicator}>*</Text>
                    </View>
                    <SegmentedButtons
                      value={formData.amount.toString()}
                      onValueChange={value => {
                        const numValue = Number(value);
                        setFormData(prev => ({ ...prev, amount: numValue }));
                        if (numValue !== 0) setCustomAmount('');
                      }}
                      buttons={BEER_SIZES.map(size => ({
                        value: size.value.toString(),
                        label: size.label,
                        style: [
                          styles.segmentButton,
                          formData.amount.toString() === size.value.toString() && styles.selectedSegment,
                        ],
                        labelStyle: [
                          styles.segmentLabel,
                          formData.amount.toString() === size.value.toString() && styles.selectedSegmentLabel,
                        ],
                      }))}
                      style={styles.segmentGroup}
                    />
                    
                    {formData.amount === 0 && (
                      <TextInput
                        label="Custom Amount (oz)"
                        value={customAmount}
                        onChangeText={setCustomAmount}
                        keyboardType="decimal-pad"
                        style={[styles.input, { marginTop: theme.spacing.sm }]}
                        mode="outlined"
                        outlineColor={theme.colors.glass.border}
                        activeOutlineColor={theme.colors.beer.amber}
                        textColor={theme.colors.text.input}
                        theme={{
                          colors: {
                            onSurfaceVariant: theme.colors.text.label,
                            background: theme.colors.glass.background,
                          },
                        }}
                        error={customAmount && isNaN(Number(customAmount))}
                      />
                    )}
                  </View>

                  {/* Rating */}
                  <View>
                    <Text style={[styles.sectionTitle, { marginTop: theme.spacing.sm }]}>
                      Rating
                      <Text style={styles.optionalText}> (Optional)</Text>
                    </Text>
                    <View style={styles.ratingContainer}>
                      {renderRatingStars()}
                    </View>
                  </View>

                  {/* Notes and Method */}
                  <View style={styles.bottomSection}>
                    <View>
                      <Text style={styles.sectionTitle}>
                        Tasting Notes
                        <Text style={styles.optionalText}> (Optional)</Text>
                      </Text>
                      <TextInput
                        value={formData.notes}
                        onChangeText={(value) => setFormData(prev => ({ ...prev, notes: value }))}
                        multiline
                        numberOfLines={3}
                        style={[styles.input, styles.notesInput]}
                        mode="outlined"
                        outlineColor={theme.colors.glass.border}
                        activeOutlineColor={theme.colors.beer.amber}
                        textColor={theme.colors.text.input}
                        theme={{
                          colors: {
                            onSurfaceVariant: theme.colors.text.label,
                            background: theme.colors.glass.background,
                          },
                        }}
                      />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>
                        Method
                        <Text style={styles.optionalText}> (Optional)</Text>
                      </Text>
                      <TextInput
                        value={formData.method}
                        onChangeText={(value) => setFormData(prev => ({ ...prev, method: value }))}
                        placeholder="e.g., funnel, shotgun, chug"
                        style={styles.input}
                        mode="outlined"
                        outlineColor={theme.colors.glass.border}
                        activeOutlineColor={theme.colors.beer.amber}
                        textColor={theme.colors.text.input}
                        theme={{
                          colors: {
                            onSurfaceVariant: theme.colors.text.label,
                            background: theme.colors.glass.background,
                          },
                        }}
                      />
                    </View>
                  </View>

                  {/* Location Status */}
                  <View style={styles.locationContainer}>
                    <IconButton
                      icon="map-marker"
                      size={24}
                      iconColor={location ? theme.colors.beer.amber : theme.colors.text.secondary}
                    />
                    <Text style={[
                      styles.locationText,
                      location && styles.locationCaptured
                    ]}>
                      {location
                        ? 'Location captured'
                        : locationError
                        ? `⚠️ ${locationError}`
                        : 'Acquiring location...'}
                    </Text>
                  </View>

                  {/* Log Button */}
                  <Button
                    mode="contained"
                    onPress={handleLogDrink}
                    loading={loading}
                    disabled={loading || !location}
                    style={styles.logButton}
                    contentStyle={styles.logButtonContent}
                    buttonColor={theme.colors.beer.amber}
                    textColor={theme.colors.beer.darkWood}
                  >
                    {loading ? 'Logging...' : 'Log Beer'}
                  </Button>
                </Card.Content>
              </LinearGradient>
            </Card>

            {/* Previous Brands Modal with Swipe to Dismiss */}
            <Portal>
              <Modal
                visible={showBrandsModal}
                onDismiss={() => setShowBrandsModal(false)}
                contentContainerStyle={styles.modal}
              >
                <Swipeable
                  renderRightActions={() => null}
                  onSwipeableOpen={() => setShowBrandsModal(false)}
                >
                  <Card style={styles.glassCard}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)', 'transparent']}
                      locations={[0, 0.3, 1]}
                      style={styles.cardGradient}
                    >
                      <Card.Title title="Previous Brands" titleStyle={styles.modalTitle} />
                      <Card.Content>
                        {previousBrands.map((brand) => (
                          <List.Item
                            key={brand}
                            title={brand}
                            onPress={() => {
                              setFormData(prev => ({ ...prev, brand }));
                              setShowBrandsModal(false);
                            }}
                            titleStyle={styles.modalListText}
                            style={styles.modalListItem}
                          />
                        ))}
                        {previousBrands.length === 0 && (
                          <Text style={styles.noDataText}>No previous brands found</Text>
                        )}
                      </Card.Content>
                    </LinearGradient>
                  </Card>
                </Swipeable>
              </Modal>
            </Portal>
          </KeyboardAwareScrollView>
        </LinearGradient>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerIcon: {
    marginRight: theme.spacing.sm,
  },
  title: {
    color: theme.colors.beer.amber,
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    textShadowColor: 'rgba(251, 192, 45, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  glassCard: {
    backgroundColor: theme.colors.glass.background,
    borderColor: theme.colors.glass.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
  },
  cardContent: {
    gap: theme.spacing.md,
  },
  input: {
    backgroundColor: 'transparent',
  },
  notesInput: {
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    marginBottom: theme.spacing.sm,
  },
  dropdownButton: {
    borderColor: theme.colors.glass.border,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  dropdownButtonSelected: {
    borderColor: theme.colors.beer.amber,
  },
  containerMenu: {
    backgroundColor: theme.colors.glass.background,
    borderRadius: theme.borderRadius.md,
    borderColor: theme.colors.glass.border,
    borderWidth: 1,
  },
  menuItemText: {
    color: theme.colors.text.input,
    fontFamily: theme.fonts.regular,
  },
  segmentGroup: {
    marginBottom: theme.spacing.md,
  },
  segmentButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.glass.border,
  },
  selectedSegment: {
    backgroundColor: theme.colors.beer.amber,
    borderColor: theme.colors.beer.amber,
  },
  segmentLabel: {
    color: theme.colors.text.input,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
  },
  selectedSegmentLabel: {
    color: theme.colors.beer.darkWood,
    fontFamily: theme.fonts.medium,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: -theme.spacing.sm,
  },
  bottomSection: {
    marginTop: -theme.spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.glass.highlight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
  },
  locationText: {
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.regular,
  },
  locationCaptured: {
    color: theme.colors.beer.amber,
  },
  logButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  logButtonContent: {
    paddingVertical: theme.spacing.md,
  },
  modal: {
    margin: theme.spacing.lg,
  },
  modalTitle: {
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.semiBold,
  },
  modalListText: {
    color: theme.colors.text.input,
    fontFamily: theme.fonts.regular,
  },
  modalListItem: {
    borderRadius: theme.borderRadius.sm,
  },
  noDataText: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
    padding: theme.spacing.md,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  requiredIndicator: {
    color: theme.colors.beer.amber,
    fontSize: 16,
    marginLeft: theme.spacing.xs,
  },
  optionalText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
  },
  suggestionsCard: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: theme.colors.glass.background,
    borderColor: theme.colors.glass.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    marginTop: 4,
  },
  suggestionText: {
    color: theme.colors.text.input,
    fontFamily: theme.fonts.regular,
  },
});

export default LogDrinkScreen; 