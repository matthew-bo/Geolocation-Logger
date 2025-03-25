import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Avatar,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  LocalBar as BeerIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function FriendStatsDialog({ open, onClose, friend }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (friend?.id && open) {
      fetchFriendStats();
    }
  }, [friend, open]);

  const fetchFriendStats = async () => {
    setLoading(true);
    try {
      const drinksQuery = query(
        collection(db, 'drinks'),
        where('userId', '==', friend.id)
      );
      const drinksSnapshot = await getDocs(drinksQuery);
      const drinks = drinksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate stats
      const uniqueBeers = [...new Set(drinks.map(drink => drink.brand))];
      const ratings = drinks.map(drink => drink.rating).filter(rating => rating > 0);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b) / ratings.length : 0;

      // Find favorite beer
      const beerCounts = drinks.reduce((acc, drink) => {
        if (drink.brand) {
          acc[drink.brand] = (acc[drink.brand] || 0) + 1;
        }
        return acc;
      }, {});
      
      const sortedBeers = Object.entries(beerCounts).sort((a, b) => b[1] - a[1]);
      const favoriteBeer = sortedBeers.length > 0 ? sortedBeers[0][0] : null;

      setStats({
        totalDrinks: drinks.length,
        uniqueBeers: uniqueBeers.length,
        favoriteBeer,
        averageRating: avgRating,
      });
    } catch (error) {
      console.error('Error fetching friend stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!friend) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'var(--background)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'var(--beer-amber)',
            fontSize: '2rem',
            margin: '0 auto 1rem',
          }}
        >
          {friend.username?.[0]?.toUpperCase() || friend.displayName?.[0]?.toUpperCase() || '?'}
        </Avatar>
        <Typography variant="h5" className="logo-text">
          {friend.username || friend.displayName || 'Anonymous Beer Lover'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={6}>
                <Box className="stat-card">
                  <BeerIcon sx={{ fontSize: 40, color: 'var(--beer-amber)', mb: 1 }} />
                  <Typography className="stat-value">{stats.totalDrinks}</Typography>
                  <Typography className="stat-label">Total Beers</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box className="stat-card">
                  <BeerIcon sx={{ fontSize: 40, color: 'var(--beer-amber)', mb: 1 }} />
                  <Typography className="stat-value">{stats.uniqueBeers}</Typography>
                  <Typography className="stat-label">Unique Beers</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box className="stat-card">
                  <StarIcon sx={{ fontSize: 40, color: 'var(--beer-amber)', mb: 1 }} />
                  <Typography className="stat-value">
                    {stats.averageRating.toFixed(1)}
                  </Typography>
                  <Typography className="stat-label">Avg Rating</Typography>
                </Box>
              </Grid>
            </Grid>

            {stats.favoriteBeer && (
              <Box className="drink-card" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="var(--text-secondary)">
                  Favorite Beer
                </Typography>
                <Typography variant="h5" className="logo-text">
                  {stats.favoriteBeer}
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 