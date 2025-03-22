import {
  Box,
  Skeleton,
  Paper,
} from '@mui/material';

export function DrinkFormSkeleton() {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto', mb: 4 }} />
        
        <Box sx={{ mb: 4 }}>
          {[1, 2, 3].map((step) => (
            <Box key={step} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Skeleton variant="text" width={100} />
            </Box>
          ))}
        </Box>

        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Skeleton variant="rectangular" width={100} height={36} />
        </Box>
      </Paper>
    </Box>
  );
}

export function LocationPickerSkeleton() {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Skeleton variant="rectangular" height={56} sx={{ flex: 1 }} />
        <Skeleton variant="circular" width={56} height={56} />
      </Box>
      
      <Paper sx={{ p: 2 }}>
        {[1, 2, 3].map((item) => (
          <Box key={item} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export function RatingStepSkeleton() {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Skeleton variant="text" width="40%" sx={{ mx: 'auto', mb: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Skeleton
            key={star}
            variant="circular"
            width={40}
            height={40}
            sx={{ mx: 1 }}
          />
        ))}
      </Box>
      <Skeleton variant="rectangular" height={120} />
    </Box>
  );
} 