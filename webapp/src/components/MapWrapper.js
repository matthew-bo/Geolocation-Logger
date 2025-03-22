import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';

// Dynamically import MapComponent with no SSR
const MapComponent = dynamic(
  () => import('./MapComponent'),
  { 
    ssr: false,
    loading: () => null 
  }
);

export default function MapWrapper(props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%',
        bgcolor: '#121212'
      }}>
        <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
      </Box>
    );
  }

  return <MapComponent {...props} />;
} 