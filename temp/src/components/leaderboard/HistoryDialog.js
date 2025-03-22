import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
  Fade,
} from '@mui/material';
import { db } from '../../config/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

function formatPeriod(period) {
  const [year, type, value] = period.split('-');
  if (type === 'W') {
    return `Week ${value}, ${year}`;
  } else if (type === 'M') {
    const date = new Date(year, parseInt(value) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  } else if (type === 'D') {
    return new Date(period).toLocaleDateString();
  } else {
    return `${year}`;
  }
}

export default function HistoryDialog({ open, onClose, group }) {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const historyQuery = query(
        collection(db, 'groupHistory'),
        where('groupId', '==', group.id),
        orderBy('period', 'desc')
      );
      const snapshot = await getDocs(historyQuery);
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Group by period
      const uniquePeriods = [...new Set(historyData.map(h => h.period))];
      setPeriods(uniquePeriods);
      
      if (uniquePeriods.length > 0) {
        setSelectedPeriod(uniquePeriods[0]);
        const periodRankings = historyData
          .filter(h => h.period === uniquePeriods[0])
          .sort((a, b) => b.totalBeers - a.totalBeers);
        setRankings(periodRankings);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const periodRankings = periods
      .filter(h => h.period === period)
      .sort((a, b) => b.totalBeers - a.totalBeers);
    setRankings(periodRankings);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'var(--background)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        }
      }}
    >
      <DialogTitle>Historical Rankings</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: 'var(--beer-amber)' }} />
          </Box>
        ) : periods.length === 0 ? (
          <Typography color="var(--text-secondary)" sx={{ textAlign: 'center', py: 4 }}>
            No historical data available yet
          </Typography>
        ) : (
          <>
            <Tabs
              value={selectedPeriod}
              onChange={(e, newValue) => handlePeriodChange(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 3,
                borderBottom: '1px solid var(--glass-border)',
                '& .MuiTab-root': {
                  color: 'var(--text-secondary)',
                  '&.Mui-selected': {
                    color: 'var(--beer-amber)',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'var(--beer-amber)',
                },
              }}
            >
              {periods.map((period) => (
                <Tab
                  key={period}
                  label={formatPeriod(period)}
                  value={period}
                />
              ))}
            </Tabs>

            <Fade in={true}>
              <List>
                {rankings.map((ranking, index) => (
                  <ListItem
                    key={ranking.userId}
                    sx={{ 
                      mb: 2,
                      bgcolor: 'var(--glass-background)',
                      borderRadius: 1,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        bgcolor: index === 0 ? 'gold' : 
                                index === 1 ? 'silver' :
                                index === 2 ? '#cd7f32' : 'transparent'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ minWidth: 30 }}>
                            #{index + 1}
                          </Typography>
                          <Typography>
                            {ranking.username || 'Unknown User'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="var(--text-secondary)">
                            {ranking.totalBeers} beers • {ranking.activeDays} active days • 
                            {ranking.consecutiveDays} day streak
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Fade>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
} 