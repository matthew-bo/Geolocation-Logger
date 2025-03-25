export const theme = {
  colors: {
    // Base colors
    background: {
      primary: '#121212',
      secondary: '#1e1e1e',
      tertiary: '#282828',
      glass: 'rgba(30, 18, 16, 0.75)',
    },
    
    // Beer theme colors
    beer: {
      amber: '#FBC02D',
      copper: '#D84315',
      copperLight: '#F4511E',
      dark: '#1E1210',
      darkWood: '#1E1210',
      lightWood: '#6D4C41',
      cream: '#FFF8E1',
      foam: '#FFECB3',
      beerFoam: '#FFFDE7',
      // Beer type colors for map markers
      types: {
        lager: '#FFB300',
        ale: '#FB8C00',
        ipa: '#F57C00',
        stout: '#6D4C41',
        porter: '#5D4037',
        wheat: '#FDD835',
        pilsner: '#FFC107',
        sour: '#FF7043',
        other: '#FBC02D',
      },
      gradient: {
        start: '#2C1810',
        middle: '#1E1210',
        end: '#121212',
      }
    },
    
    // Text colors
    text: {
      primary: 'rgba(255, 255, 255, 0.87)',
      secondary: 'rgba(255, 255, 255, 0.6)',
      input: 'rgba(255, 255, 255, 0.7)',
      label: 'rgba(255, 255, 255, 0.6)',
    },
    
    // Glass effect
    glass: {
      border: 'rgba(251, 192, 45, 0.3)',
      shadow: 'rgba(0, 0, 0, 0.4)',
      background: 'rgba(30, 18, 16, 0.85)',
      highlight: 'rgba(255, 255, 255, 0.05)',
    },

    // Status colors
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
  },
  
  typography: {
    fontFamily: 'Inter',
    
    h1: {
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '700',
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      textTransform: 'none',
    },
  },
  
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.14)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.16)',
  },
  
  // Common component styles
  components: {
    card: {
      background: 'rgba(42, 39, 35, 0.75)',
      borderColor: 'rgba(251, 192, 45, 0.3)',
      borderRadius: 16,
    },
    button: {
      primary: {
        backgroundColor: '#FBC02D',
        color: '#3E2723',
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: '#FBC02D',
        color: '#FBC02D',
      },
    },
  },
}; 