import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  TextField,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import {
  BarChart as BarChartIcon,
  CalendarMonth as CalendarIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfWeek, endOfWeek, isSameMonth, isToday, isFuture } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const timeFrameOptions = [
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: '3months', label: 'Past 3 Months' },
  { value: 'year', label: 'Past Year' },
];

const metricOptions = [
  { value: 'total', label: 'Total Drinks' },
  { value: 'unique', label: 'Unique Beers' },
  { value: 'rating', label: 'Average Rating' },
];

const groupByOptions = [
  { value: 'day', label: 'By Day' },
  { value: 'week', label: 'By Week' },
  { value: 'month', label: 'By Month' },
];

const Calendar = ({ data, metric, currentDate, setCurrentDate }) => {
  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    const days = eachDayOfInterval({ start, end });
    
    const weeksArray = [];
    let currentWeek = [];
    
    days.forEach(day => {
      if (currentWeek.length === 0 && getDay(day) !== 0) {
        for (let i = 0; i < getDay(day); i++) {
          currentWeek.push(null);
        }
      }
      
      currentWeek.push(day);
      
      if (getDay(day) === 6) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArray.push(currentWeek);
    }
    
    return weeksArray;
  }, [currentDate]);

  const getDateValue = (date) => {
    if (!date) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return data[dateStr] || 0;
  };

  const maxValue = Math.max(...Object.values(data));

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        <IconButton 
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          size="small"
        >
          <Typography variant="body2">←</Typography>
        </IconButton>
        <Typography variant="subtitle1">
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <IconButton 
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          size="small"
        >
          <Typography variant="body2">→</Typography>
        </IconButton>
      </Box>
      <Grid container spacing={0.5}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <Grid item xs={12/7} key={day}>
            <Typography align="center" sx={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 0.5 }}>
        {weeks.map((week, weekIndex) => (
          <Grid container spacing={0.5} key={weekIndex}>
            {week.map((day, dayIndex) => (
              <Grid item xs={12/7} key={dayIndex}>
                {day && (
                  <Tooltip title={
                    `${format(day, 'MMM d, yyyy')}
${getDateValue(day)} ${metric === 'total' ? 'drinks' : metric === 'unique' ? 'unique beers' : 'avg rating'}`
                  }>
                    <Box
                      sx={{
                        aspectRatio: '1',
                        p: 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 0.5,
                        cursor: 'pointer',
                        position: 'relative',
                        bgcolor: isToday(day) 
                          ? 'var(--beer-amber)'
                          : isFuture(day)
                          ? 'transparent'
                          : `rgba(251, 192, 45, ${getDateValue(day) / (maxValue || 1) * 0.7})`,
                        border: theme => isSameMonth(day, currentDate)
                          ? isToday(day)
                            ? '1px solid var(--copper)'
                            : '1px solid var(--border-color)'
                          : '1px solid var(--border-color)',
                        opacity: isSameMonth(day, currentDate) ? 1 : 0.3,
                        '&:hover': {
                          bgcolor: 'var(--beer-amber)',
                          opacity: 0.8,
                        },
                        minHeight: { xs: 24, sm: 32 },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          color: isToday(day) ? '#000' : 'var(--text-primary)',
                          fontWeight: isToday(day) ? 'bold' : 'normal',
                          lineHeight: 1,
                        }}
                      >
                        {format(day, 'd')}
                      </Typography>
                      {getDateValue(day) > 0 && (
                        <Typography
                          sx={{
                            fontSize: { xs: '0.6rem', sm: '0.65rem' },
                            color: isToday(day) ? '#000' : 'var(--text-secondary)',
                            lineHeight: 1,
                            mt: 0.25,
                          }}
                        >
                          {getDateValue(day)}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                )}
              </Grid>
            ))}
          </Grid>
        ))}
      </Box>
    </Box>
  );
};

export default function DrinkGraph({ drinks }) {
  const [timeFrame, setTimeFrame] = useState('month');
  const [metric, setMetric] = useState('total');
  const [groupBy, setGroupBy] = useState('day');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewType, setViewType] = useState('bar');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get unique locations from drinks
  const locations = useMemo(() => {
    const locationSet = new Set();
    drinks.forEach(drink => {
      if (drink.placeInfo?.city) locationSet.add(drink.placeInfo.city);
      if (drink.placeInfo?.state) locationSet.add(drink.placeInfo.state);
      if (drink.placeInfo?.country) locationSet.add(drink.placeInfo.country);
    });
    return Array.from(locationSet);
  }, [drinks]);

  // Process data for both bar chart and calendar
  const processedData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    switch (timeFrame) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    let filteredDrinks = drinks.filter(drink => {
      const drinkDate = new Date(drink.timestamp);
      const locationMatch = !selectedLocation || 
        drink.placeInfo?.city === selectedLocation ||
        drink.placeInfo?.state === selectedLocation ||
        drink.placeInfo?.country === selectedLocation;
      return drinkDate >= startDate && drinkDate <= now && locationMatch;
    });

    // Group drinks by selected interval
    const groups = {};
    filteredDrinks.forEach(drink => {
      const date = new Date(drink.timestamp);
      let groupKey;
      
      switch (groupBy) {
        case 'day':
          groupKey = format(date, 'yyyy-MM-dd');
          break;
        case 'week':
          const weekStart = startOfWeek(date);
          groupKey = format(weekStart, 'yyyy-MM-dd');
          break;
        case 'month':
          groupKey = format(date, 'yyyy-MM');
          break;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          drinks: [],
          uniqueBeers: new Set(),
          ratings: [],
        };
      }
      groups[groupKey].drinks.push(drink);
      groups[groupKey].uniqueBeers.add(drink.brand);
      if (drink.rating) groups[groupKey].ratings.push(drink.rating);
    });

    // Calculate metrics for each group
    const labels = Object.keys(groups).sort();
    const data = labels.map(key => {
      const group = groups[key];
      switch (metric) {
        case 'total':
          return group.drinks.length;
        case 'unique':
          return group.uniqueBeers.size;
        case 'rating':
          return group.ratings.length > 0
            ? group.ratings.reduce((a, b) => a + b) / group.ratings.length
            : 0;
      }
    });

    // For calendar view, create a map of date to value
    const calendarData = {};
    Object.entries(groups).forEach(([date, group]) => {
      calendarData[date] = metric === 'total' 
        ? group.drinks.length 
        : metric === 'unique'
        ? group.uniqueBeers.size
        : group.ratings.length > 0
        ? group.ratings.reduce((a, b) => a + b) / group.ratings.length
        : 0;
    });

    return { labels, data, calendarData };
  }, [drinks, timeFrame, metric, groupBy, selectedLocation]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${metricOptions.find(m => m.value === metric)?.label || ''} ${groupByOptions.find(g => g.value === groupBy)?.label || ''}`,
        color: 'var(--text-primary)',
        font: {
          size: 16,
          weight: 'normal',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = '';
            if (metric === 'rating') {
              label = `Rating: ${context.raw.toFixed(1)}`;
            } else {
              label = `${context.raw} ${metric === 'total' ? 'drinks' : 'beers'}`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: metric === 'rating' ? 1 : 0,
          color: 'var(--text-secondary)',
        },
        grid: {
          color: 'var(--border-color)',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: 'var(--text-secondary)',
        },
        grid: {
          display: false,
        },
      }
    }
  };

  const chartData = {
    labels: processedData.labels.map(label => 
      groupBy === 'month' 
        ? format(new Date(label), 'MMM yyyy')
        : format(new Date(label), 'MMM d')
    ),
    datasets: [
      {
        data: processedData.data,
        backgroundColor: 'rgba(251, 192, 45, 0.6)',
        borderColor: 'var(--copper)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'var(--beer-amber)',
      }
    ]
  };

  const handleShare = async (platform) => {
    const title = 'My Beer Stats';
    const text = `Check out my beer stats: ${metricOptions.find(m => m.value === metric)?.label} ${groupByOptions.find(g => g.value === groupBy)?.label}`;
    const url = window.location.href;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setSnackbarMessage('Link copied to clipboard!');
          setSnackbarOpen(true);
        } catch (err) {
          setSnackbarMessage('Failed to copy link');
          setSnackbarOpen(true);
        }
        break;
    }
    setShareDialogOpen(false);
  };

  return (
    <Card className="premium-card" sx={{ overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={(e, newValue) => newValue && setViewType(newValue)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: 'var(--text-secondary)',
                '&.Mui-selected': {
                  color: 'var(--beer-amber)',
                  bgcolor: 'rgba(251, 192, 45, 0.1)',
                },
              },
            }}
          >
            <ToggleButton value="bar">
              <Tooltip title="Bar Chart">
                <BarChartIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="calendar">
              <Tooltip title="Calendar View">
                <CalendarIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <IconButton 
            onClick={() => setShareDialogOpen(true)}
            sx={{ color: 'var(--text-secondary)' }}
          >
            <ShareIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {viewType === 'bar' && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Frame</InputLabel>
                <Select
                  value={timeFrame}
                  label="Time Frame"
                  onChange={(e) => setTimeFrame(e.target.value)}
                >
                  {timeFrameOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Metric</InputLabel>
              <Select
                value={metric}
                label="Metric"
                onChange={(e) => setMetric(e.target.value)}
              >
                {metricOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {viewType === 'bar' && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Group By</InputLabel>
                <Select
                  value={groupBy}
                  label="Group By"
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  {groupByOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              size="small"
              value={selectedLocation}
              onChange={(event, newValue) => setSelectedLocation(newValue)}
              options={locations}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Location"
                  fullWidth
                />
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ height: { xs: 300, sm: 400 } }}>
          {viewType === 'bar' ? (
            <Bar options={chartOptions} data={chartData} />
          ) : (
            <Calendar 
              data={processedData.calendarData}
              metric={metric}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
            />
          )}
        </Box>

        {/* Share Dialog */}
        <Dialog 
          open={shareDialogOpen} 
          onClose={() => setShareDialogOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: 'var(--background)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }
          }}
        >
          <DialogTitle>Share Stats</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={3}>
                <IconButton 
                  onClick={() => handleShare('facebook')}
                  sx={{ color: '#1877f2' }}
                >
                  <FacebookIcon />
                </IconButton>
              </Grid>
              <Grid item xs={3}>
                <IconButton 
                  onClick={() => handleShare('twitter')}
                  sx={{ color: '#1da1f2' }}
                >
                  <TwitterIcon />
                </IconButton>
              </Grid>
              <Grid item xs={3}>
                <IconButton 
                  onClick={() => handleShare('whatsapp')}
                  sx={{ color: '#25d366' }}
                >
                  <WhatsAppIcon />
                </IconButton>
              </Grid>
              <Grid item xs={3}>
                <IconButton 
                  onClick={() => handleShare('copy')}
                  sx={{ color: 'var(--text-primary)' }}
                >
                  <CopyIcon />
                </IconButton>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShareDialogOpen(false)}
              sx={{ color: 'var(--text-secondary)' }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity="success"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
} 