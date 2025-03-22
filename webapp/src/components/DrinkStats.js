import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Tooltip as MuiTooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ShareOutlined,
  FileDownload,
  CalendarToday,
  LocationOn,
  BarChart as BarChartIcon,
  GridOn,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, subDays, subWeeks, subMonths, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import DrinkGraph from './DrinkGraph';

const timeUnitOptions = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

const presetRanges = [
  { value: '7d', label: 'Past Week', fn: (date) => subDays(date, 7) },
  { value: '1m', label: 'Past Month', fn: (date) => subMonths(date, 1) },
  { value: '3m', label: 'Past 3 Months', fn: (date) => subMonths(date, 3) },
  { value: '1y', label: 'Past Year', fn: (date) => subMonths(date, 12) },
];

const metricOptions = [
  { value: 'total', label: 'Total Beers', color: '#8884d8' },
  { value: 'unique', label: 'Unique Beers', color: '#82ca9d' },
  { value: 'rating', label: 'Average Rating', color: '#ffc658' },
];

export default function DrinkStats({
  initialView,
  initialTimeUnit,
  initialStartDate,
  initialEndDate,
  initialMetrics,
  initialLocation,
  isShared = false,
}) {
  const { user } = useAuth();
  const [viewType, setViewType] = useState(initialView || 'bar');
  const [timeUnit, setTimeUnit] = useState(initialTimeUnit || 'day');
  const [startDate, setStartDate] = useState(() => 
    initialStartDate ? parseISO(initialStartDate) : subDays(new Date(), 7)
  );
  const [endDate, setEndDate] = useState(() =>
    initialEndDate ? parseISO(initialEndDate) : new Date()
  );
  const [selectedMetrics, setSelectedMetrics] = useState(initialMetrics || ['total']);
  const [location, setLocation] = useState(initialLocation || null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        timeUnit,
      });

      if (location) {
        params.append('location', JSON.stringify(location));
      }

      const response = await fetch(`/api/stats?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const stats = await response.json();
      setData(stats);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, timeUnit, location]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMetricToggle = (event, newMetrics) => {
    if (newMetrics.length) {
      setSelectedMetrics(newMetrics);
    }
  };

  const handlePresetRange = (preset) => {
    const end = new Date();
    const start = preset.fn(end);
    setStartDate(start);
    setEndDate(end);
  };

  const handleShare = useCallback(() => {
    // Generate shareable URL with current view settings
    const params = new URLSearchParams({
      view: viewType,
      timeUnit,
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd'),
      metrics: selectedMetrics.join(','),
    });
    if (location) {
      params.append('location', JSON.stringify(location));
    }
    const url = `${window.location.origin}/share/stats?${params.toString()}`;
    setShareUrl(url);
    setShareDialogOpen(true);
  }, [viewType, timeUnit, startDate, endDate, selectedMetrics, location]);

  const handleExport = useCallback(() => {
    const csvContent = data
      .map((row) => {
        const values = [row.date];
        selectedMetrics.forEach((metric) => values.push(row[metric]));
        return values.join(',');
      })
      .join('\n');

    const headers = ['date', ...selectedMetrics].join(',');
    const blob = new Blob([headers + '\n' + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drink-stats-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [data, selectedMetrics]);

  const renderChart = () => {
    if (viewType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(parseISO(date), 'MMM d')}
            />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2">
                          {format(parseISO(label), 'MMM d, yyyy')}
                        </Typography>
                        {payload.map((entry) => (
                          <Typography key={entry.name} variant="body2">
                            {entry.name}: {entry.value}
                          </Typography>
                        ))}
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {selectedMetrics.map((metric) => {
              const metricConfig = metricOptions.find((m) => m.value === metric);
              return (
                <Bar
                  key={metric}
                  dataKey={metric}
                  name={metricConfig.label}
                  fill={metricConfig.color}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Calendar view
    return (
      <Box sx={{ 
        height: { xs: 300, sm: 350 },
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <DrinkGraph drinks={data} />
      </Box>
    );
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Drink Statistics</Typography>
            {!isShared && (
              <Stack direction="row" spacing={1}>
                <MuiTooltip title="Share">
                  <IconButton onClick={handleShare}>
                    <ShareOutlined />
                  </IconButton>
                </MuiTooltip>
                <MuiTooltip title="Export CSV">
                  <IconButton onClick={handleExport}>
                    <FileDownload />
                  </IconButton>
                </MuiTooltip>
              </Stack>
            )}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={(e, value) => value && setViewType(value)}
            >
              <ToggleButton value="bar">
                <BarChartIcon />
              </ToggleButton>
              <ToggleButton value="heatmap">
                <GridOn />
              </ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              value={selectedMetrics}
              onChange={handleMetricToggle}
              aria-label="metrics"
              multiple
            >
              {metricOptions.map((option) => (
                <ToggleButton key={option.value} value={option.value}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <TextField
              select
              label="Time Unit"
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              {timeUnitOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} />}
            />
            <Stack direction="row" spacing={1}>
              {presetRanges.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outlined"
                  size="small"
                  onClick={() => handlePresetRange(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </Stack>
          </Stack>

          <TextField
            label="Location Filter"
            select
            value={location?.type || ''}
            onChange={(e) => {
              if (!e.target.value) {
                setLocation(null);
              } else {
                setLocation({ type: e.target.value, value: '' });
              }
            }}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="city">City</MenuItem>
            <MenuItem value="state">State</MenuItem>
            <MenuItem value="country">Country</MenuItem>
          </TextField>

          {location && (
            <TextField
              label={`Select ${location.type}`}
              value={location.value}
              onChange={(e) => setLocation({ ...location, value: e.target.value })}
            />
          )}

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {renderChart()}
            </>
          )}
        </Stack>
      </CardContent>

      {!isShared && (
        <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
          <DialogTitle>Share Statistics</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              value={shareUrl}
              InputProps={{
                readOnly: true,
              }}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                setShareDialogOpen(false);
              }}
            >
              Copy Link
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Card>
  );
} 