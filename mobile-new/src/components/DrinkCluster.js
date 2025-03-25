import React, { useMemo } from 'react';
import { View, Text, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

const DrinkCluster = ({ coordinate, pointCount, onPress }) => {
  const clusterStyle = useMemo(() => {
    const size = Math.min(pointCount * 8, 40);
    return {
      backgroundColor: `${theme.colors.beer.amber}80`,
      padding: 5,
      borderRadius: size / 2,
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.beer.amber,
      shadowColor: theme.colors.beer.amber,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: (Platform?.OS === 'android') ? 5 : 0,
    };
  }, [pointCount]);

  const textStyle = useMemo(() => ({
    color: theme.colors.text.primary,
    fontSize: Math.min(pointCount * 2, 14),
    fontWeight: 'bold',
    marginTop: 2,
    fontFamily: theme.fonts.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }), [pointCount]);

  const iconSize = Math.min(pointCount * 4, 24);
  
  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={clusterStyle}>
        <MaterialCommunityIcons 
          name="beer" 
          size={iconSize}
          color={theme.colors.text.primary}
        />
        <Text style={textStyle}>
          {pointCount}
        </Text>
      </View>
    </Marker>
  );
};

export default React.memo(DrinkCluster); 