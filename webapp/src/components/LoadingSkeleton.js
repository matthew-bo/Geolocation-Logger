import { Box, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

const ShimmerSkeleton = styled(Skeleton)({
  background: 'linear-gradient(90deg, var(--glass-background) 0%, var(--glass-border) 50%, var(--glass-background) 100%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 2s infinite',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transform: 'translateX(-100%)',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
    animation: 'shimmer 2s infinite',
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
});

const SkeletonCard = styled(Box)({
  background: 'var(--glass-background)',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '16px',
  overflow: 'hidden',
});

export function DrinkCardSkeleton() {
  return (
    <SkeletonCard sx={{ p: 3, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ShimmerSkeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1, ml: 2 }}>
          <ShimmerSkeleton variant="text" width="60%" height={24} />
          <ShimmerSkeleton variant="text" width="40%" height={20} />
        </Box>
      </Box>
      <ShimmerSkeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ShimmerSkeleton variant="text" width="30%" height={24} />
        <ShimmerSkeleton variant="text" width="20%" height={24} />
      </Box>
    </SkeletonCard>
  );
}

export function ProfileSkeleton() {
  return (
    <SkeletonCard sx={{ p: 3, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <ShimmerSkeleton variant="circular" width={80} height={80} />
        <Box sx={{ flex: 1, ml: 3 }}>
          <ShimmerSkeleton variant="text" width="70%" height={32} />
          <ShimmerSkeleton variant="text" width="50%" height={24} />
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i}>
            <ShimmerSkeleton variant="text" width="80%" height={28} />
            <ShimmerSkeleton variant="text" width="60%" height={24} />
          </Box>
        ))}
      </Box>
    </SkeletonCard>
  );
}

export function FriendListSkeleton() {
  return (
    <SkeletonCard sx={{ p: 3, mb: 2 }}>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ShimmerSkeleton variant="circular" width={50} height={50} />
          <Box sx={{ flex: 1, ml: 2 }}>
            <ShimmerSkeleton variant="text" width="40%" height={24} />
            <ShimmerSkeleton variant="text" width="60%" height={20} />
          </Box>
          <ShimmerSkeleton variant="circular" width={40} height={40} />
        </Box>
      ))}
    </SkeletonCard>
  );
}

export function MapSkeleton() {
  return (
    <SkeletonCard sx={{ p: 0, position: 'relative', height: '400px' }}>
      <ShimmerSkeleton 
        variant="rectangular" 
        width="100%" 
        height="100%" 
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {[1, 2, 3].map((i) => (
          <ShimmerSkeleton 
            key={i}
            variant="rectangular" 
            width={32} 
            height={32} 
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Box>
    </SkeletonCard>
  );
}

export function StatCardSkeleton() {
  return (
    <SkeletonCard sx={{ p: 3, textAlign: 'center' }}>
      <ShimmerSkeleton 
        variant="circular" 
        width={60} 
        height={60} 
        sx={{ mx: 'auto', mb: 2 }}
      />
      <ShimmerSkeleton variant="text" width="80%" height={28} sx={{ mx: 'auto' }} />
      <ShimmerSkeleton variant="text" width="60%" height={24} sx={{ mx: 'auto' }} />
    </SkeletonCard>
  );
} 