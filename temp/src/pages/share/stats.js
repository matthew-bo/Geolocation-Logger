import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Typography } from '@mui/material';
import DrinkStats from '../../components/DrinkStats';
import { parseISO } from 'date-fns';

export default function SharedStats() {
  const router = useRouter();
  const { view, timeUnit, start, end, metrics, location } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    // Validate query parameters
    if (!start || !end || !metrics) {
      router.push('/404');
      return;
    }

    try {
      // Validate dates
      parseISO(start);
      parseISO(end);
    } catch (err) {
      router.push('/404');
    }
  }, [router, start, end, metrics]);

  if (!router.isReady) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shared Drink Statistics
      </Typography>
      <Box sx={{ mt: 3 }}>
        <DrinkStats
          initialView={view || 'bar'}
          initialTimeUnit={timeUnit || 'day'}
          initialStartDate={start}
          initialEndDate={end}
          initialMetrics={metrics.split(',')}
          initialLocation={location ? JSON.parse(location) : null}
          isShared
        />
      </Box>
    </Container>
  );
} 