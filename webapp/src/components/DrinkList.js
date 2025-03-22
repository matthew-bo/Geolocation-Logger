import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  LocalBar as BeerIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DrinkCardSkeleton } from './LoadingSkeleton';

export default function DrinkList({ drinks, onDelete, onEdit, isLoading, error }) {
  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          Error loading drinks: {error.message}
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ mt: 4 }}>
        {[1, 2, 3].map((i) => (
          <DrinkCardSkeleton key={i} />
        ))}
      </Box>
    );
  }

  if (!drinks?.length) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No drinks found
        </Typography>
      </Box>
    );
  }

  const getLocationDisplay = (placeInfo) => {
    if (!placeInfo) return 'Location not specified';
    const parts = [];
    if (placeInfo.name) parts.push(placeInfo.name);
    if (placeInfo.city) parts.push(placeInfo.city);
    if (placeInfo.state) parts.push(placeInfo.state);
    if (placeInfo.country) parts.push(placeInfo.country);
    return parts.join(', ') || 'Location not specified';
  };

  return (
    <Box sx={{ mt: 4 }}>
      {drinks.map((drink) => (
        <Card 
          key={drink.id} 
          className="glass-card"
          sx={{ 
            mb: 2,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
            }
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h6" component="div" gutterBottom>
                  {drink.drinkName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="textSecondary">
                    {format(new Date(drink.timestamp), 'PPp')}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="textSecondary">
                    {getLocationDisplay(drink.placeInfo)}
                  </Typography>
                </Stack>
                {drink.notes && (
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{ 
                      mt: 1,
                      fontStyle: 'italic',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {drink.notes}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                {onEdit && (
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => onEdit(drink)}
                      size="small"
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip title="Delete">
                    <IconButton 
                      onClick={() => onDelete(drink.id)}
                      size="small"
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack 
              direction="row" 
              spacing={2} 
              alignItems="center"
              justifyContent="space-between"
            >
              <Rating 
                value={drink.rating || 0} 
                readOnly 
                size="small"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: 'var(--beer-amber)',
                  },
                }}
              />
              {drink.container && (
                <Chip
                  icon={<BeerIcon />}
                  label={drink.container}
                  size="small"
                  sx={{ 
                    bgcolor: 'var(--glass-background)',
                    borderColor: 'var(--glass-border)',
                    color: 'var(--text-primary)',
                  }}
                />
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
} 