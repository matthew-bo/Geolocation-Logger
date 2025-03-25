import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, List, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export default function RecentActivity({ drinks, onDelete, onEdit, onLocationPress }) {
  const [editingDrinkId, setEditingDrinkId] = useState(null);
  const [editingLocationName, setEditingLocationName] = useState('');

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <View style={styles.cardWrapper}>
      <Card style={styles.card}>
        <LinearGradient
          colors={[theme.colors.beer.dark, theme.colors.beer.darkWood]}
          style={styles.cardGradient}
        >
          <Card.Content>
            <Text style={styles.title}>Recent Activity</Text>

            {drinks.map((drink, index) => (
              <React.Fragment key={drink.id}>
                <List.Item
                  title={drink.brand}
                  description={formatDate(drink.timestamp)}
                  left={props => (
                    <MaterialIcons
                      {...props}
                      name="local-drink"
                      size={24}
                      color={theme.colors.beer.amber}
                      style={styles.icon}
                    />
                  )}
                  right={props => (
                    <View style={styles.actions}>
                      {drink.placeInfo && (
                        <IconButton
                          {...props}
                          icon="map-marker"
                          iconColor={theme.colors.beer.amber}
                          size={20}
                          onPress={() => onLocationPress(drink)}
                        />
                      )}
                      {onEdit && (
                        <IconButton
                          {...props}
                          icon="pencil"
                          iconColor={theme.colors.beer.amber}
                          size={20}
                          onPress={() => onEdit(drink)}
                        />
                      )}
                      {onDelete && (
                        <IconButton
                          {...props}
                          icon="delete"
                          iconColor={theme.colors.beer.amber}
                          size={20}
                          onPress={() => onDelete(drink.id)}
                        />
                      )}
                    </View>
                  )}
                  titleStyle={styles.listItemTitle}
                  descriptionStyle={styles.listItemDescription}
                />
                {index < drinks.length - 1 && <Divider style={styles.divider} />}
              </React.Fragment>
            ))}
          </Card.Content>
        </LinearGradient>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    margin: 8,
    borderRadius: theme.borderRadius.lg,
    elevation: 4,
    shadowColor: theme.colors.beer.amber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  card: {
    backgroundColor: theme.colors.beer.dark,
    borderColor: theme.colors.beer.amber,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
  },
  cardGradient: {
    borderRadius: theme.borderRadius.lg,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.beer.amber,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemTitle: {
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.medium,
    fontSize: 16,
  },
  listItemDescription: {
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
  },
  divider: {
    backgroundColor: theme.colors.glass.border,
  },
}); 