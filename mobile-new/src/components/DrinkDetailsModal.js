import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, Card, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { formatTimestamp } from '../utils/dateUtils';

const DrinkDetailsModal = ({ visible, onDismiss, drink, isFriendsDrink }) => {
  if (!drink) return null;

  const renderDetail = (icon, label, value) => (
    <View style={styles.detailRow}>
      <MaterialCommunityIcons name={icon} size={24} color={theme.colors.beer.amber} />
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{drink.drinkName || 'Unnamed Drink'}</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
            style={styles.closeButton}
          />
        </View>
        
        <ScrollView style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              {renderDetail('beer', 'Type', drink.type || 'Not specified')}
              {renderDetail('glass-mug-variant', 'Container', drink.container || 'Not specified')}
              {renderDetail('star', 'Rating', `${drink.rating || 0}/5`)}
              {renderDetail('map-marker', 'Location', 
                drink.placeInfo?.name || 
                [drink.placeInfo?.city, drink.placeInfo?.state, drink.placeInfo?.country]
                  .filter(Boolean)
                  .join(', ') || 
                'Location not specified'
              )}
              {renderDetail('clock-outline', 'Time', formatTimestamp(drink.timestamp))}
              
              {drink.notes && (
                <View style={styles.notes}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{drink.notes}</Text>
                </View>
              )}

              {isFriendsDrink && (
                <View style={styles.friendInfo}>
                  <MaterialCommunityIcons 
                    name="account" 
                    size={24} 
                    color={theme.colors.beer.amber} 
                  />
                  <Text style={styles.friendName}>
                    Logged by {drink.user?.displayName || 'Unknown Friend'}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: theme.colors.background.primary,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
    width: '90%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.beer.amber,
    flex: 1,
  },
  closeButton: {
    margin: 0,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.glass.background,
    borderColor: theme.colors.glass.border,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  notes: {
    marginTop: 16,
    padding: 12,
    backgroundColor: theme.colors.glass.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.beer.amber,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    lineHeight: 24,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(251, 192, 45, 0.1)',
    borderRadius: 8,
  },
  friendName: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
}); 