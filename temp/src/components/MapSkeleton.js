import { Box, Skeleton } from '@mui/material';

export default function MapSkeleton() {
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        bgcolor: '#1A1A1A',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Filter toggle skeleton */}
      <Skeleton 
        variant="rectangular" 
        width={100} 
        height={32} 
        sx={{ 
          bgcolor: 'rgba(255,255,255,0.1)',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: '0 0 8px 8px'
        }}
      />

      {/* Filter bar skeleton */}
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={160} 
        sx={{ 
          bgcolor: 'rgba(255,255,255,0.05)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }}
      />

      {/* Map background skeleton */}
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height="100%" 
        animation="wave"
        sx={{ 
          bgcolor: 'rgba(255,255,255,0.05)',
          position: 'absolute',
          mt: '160px'
        }}
      />

      {/* Map controls skeleton */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 20, 
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <Skeleton 
          variant="rectangular" 
          width={30} 
          height={30} 
          sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
        />
        <Skeleton 
          variant="rectangular" 
          width={30} 
          height={90} 
          sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
        />
      </Box>

      {/* Marker skeletons */}
      {[...Array(5)].map((_, i) => (
        <Skeleton
          key={i}
          variant="circular"
          width={30}
          height={30}
          sx={{
            position: 'absolute',
            bgcolor: 'rgba(255,255,255,0.1)',
            left: `${20 + Math.random() * 60}%`,
            top: `${40 + Math.random() * 40}%`
          }}
        />
      ))}

      {/* Scale skeleton */}
      <Box sx={{ position: 'absolute', bottom: 10, right: 10 }}>
        <Skeleton 
          variant="rectangular" 
          width={100} 
          height={8} 
          sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
        />
      </Box>
    </Box>
  );
} 