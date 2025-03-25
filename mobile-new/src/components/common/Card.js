import React from 'react';
import { View } from 'react-native';
import { Surface } from 'react-native-paper';

const Card = ({ children, style, ...props }) => (
  <View style={{ 
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8
  }}>
    <Surface 
      style={[
        { 
          borderRadius: 8,
          elevation: 4
        },
        style
      ]} 
      {...props}
    >
      <View style={{ overflow: 'hidden', borderRadius: 8 }}>
        {children}
      </View>
    </Surface>
  </View>
); 