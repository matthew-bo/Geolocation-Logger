import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFA000', // Beer amber
      light: '#FFB333',
      dark: '#CC8000',
      contrastText: '#1A1412',
    },
    secondary: {
      main: '#B87333', // Copper
      light: '#D4976A',
      dark: '#8C571F',
      contrastText: '#F5E6D3',
    },
    background: {
      default: '#1A1412', // Dark wood
      paper: 'rgba(255, 255, 255, 0.05)', // Glass effect
    },
    text: {
      primary: '#F5E6D3', // Beer foam
      secondary: 'rgba(245, 230, 211, 0.7)',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'var(--accent-primary)',
          color: 'var(--dark-wood)',
          boxShadow: 'none',
          '&:hover': {
            background: 'var(--accent-primary)',
            boxShadow: '0 4px 12px rgba(255, 160, 0, 0.3)',
          },
        },
        outlined: {
          borderColor: 'var(--accent-primary)',
          color: 'var(--accent-primary)',
          '&:hover': {
            borderColor: 'var(--accent-primary)',
            background: 'rgba(255, 160, 0, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'var(--glass-background)',
            backdropFilter: 'blur(10px)',
            borderRadius: 12,
            '& fieldset': {
              borderColor: 'var(--glass-border)',
            },
            '&:hover fieldset': {
              borderColor: 'var(--accent-primary)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--accent-primary)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'var(--glass-background)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'var(--glass-background)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'var(--background-secondary)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--glass-border)',
        },
      },
    },
  },
});

export default theme; 