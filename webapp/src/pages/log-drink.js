import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Rating,
  IconButton,
  Autocomplete,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocalBar as BeerIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  SportsBar as PintIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, writeBatch, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { locationService } from '../services/locationService';

// Custom styled Rating component
const BeerRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: 'var(--beer-amber)',
  },
  '& .MuiRating-iconHover': {
    color: 'var(--copper)',
  },
});

// Beer size options
const BEER_SIZES = [
  { value: 12, label: 'Standard (12 oz)' },
  { value: 16, label: 'Guinness (16 oz)' },
  { value: 18, label: 'Mid-West Tall Boy (18 oz)' },
  { value: 24, label: 'Tall Boy (24 oz)' },
  { value: 0, label: 'Other' },
];

// Bubble component reused from index page
const Bubble = ({ delay, size, left }) => (
  <div
    className="bubble"
    style={{
      width: size,
      height: size,
      left: `${left}%`,
      bottom: '-100px',
      animation: `float 3s infinite ease-in-out ${delay}s`,
      opacity: Math.random() * 0.5 + 0.1
    }}
  />
);

export default function LogDrink() {
  const router = useRouter();
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previousBrands, setPreviousBrands] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [formData, setFormData] = useState({
    brand: '',
    drinkType: '',
    containerType: '',
    amount: 12, // Default to standard size
    rating: 0,
    notes: '',
  });

  // Generate random bubbles
  const bubbles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 20 + 10,
    left: Math.random() * 100,
    delay: Math.random() * 2
  }));

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // Fetch previous brands
    fetchPreviousBrands();
  }, [user, router]);

  const fetchPreviousBrands = async () => {
    try {
      const q = query(collection(db, 'drinks'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const brands = [...new Set(snapshot.docs.map(doc => doc.data().brand).filter(Boolean))];
      setPreviousBrands(brands);
    } catch (error) {
      console.error('Error fetching previous brands:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) return;

    setLoading(true);
    try {
      // Try to get place information from coordinates
      let placeInfo = null;
      try {
        placeInfo = await locationService.getPlaceFromCoordinates(location);
        console.log('Place info retrieved:', placeInfo);
      } catch (locationError) {
        console.error('Error getting place info:', locationError);
        // Continue with logging the drink even if getting place info fails
      }

      // Log the drink with place information if available
      const docRef = await addDoc(collection(db, 'drinks'), {
        ...formData,
        userId: user.uid,
        location: location,
        timestamp: serverTimestamp(),
        placeInfo: placeInfo || null
      });

      // Update user challenges
      await updateUserChallenges(user.uid, formData.brand);
      
      setOpenSnackbar(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error) {
      console.error('Error logging drink:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to update user's progress in active challenges
  const updateUserChallenges = async (userId, brandName) => {
    try {
      // Get all groups the user is a member of
      const userGroupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', userId)
      );
      
      const userGroupsSnapshot = await getDocs(userGroupsQuery);
      
      if (userGroupsSnapshot.empty) {
        console.log('User is not in any groups, no challenges to update');
        return;
      }
      
      const userGroupIds = userGroupsSnapshot.docs.map(doc => doc.id);
      
      if (userGroupIds.length === 0) {
        console.log('No group IDs found for user, no challenges to update');
        return;
      }
      
      console.log(`Found ${userGroupIds.length} groups for user: ${userGroupIds.join(', ')}`);
      
      // Now fetch challenges for these groups
      let challengesQuery;
      
      if (userGroupIds.length === 1) {
        // If only one group, use equality
        challengesQuery = query(
          collection(db, 'challenges'),
          where('groupId', '==', userGroupIds[0]),
          where('status', '==', 'active'),
          where('endDate', '>', new Date())
        );
      } else {
        // If multiple groups, use 'in' operator
        challengesQuery = query(
          collection(db, 'challenges'),
          where('groupId', 'in', userGroupIds),
          where('status', '==', 'active'),
          where('endDate', '>', new Date())
        );
      }
      
      const challengesSnapshot = await getDocs(challengesQuery);
      
      console.log(`Found ${challengesSnapshot.size} active challenges for user`);
      
      if (challengesSnapshot.empty) {
        console.log('No active challenges found for user');
        return;
      }
      
      // Process each challenge
      const batch = writeBatch(db);
      let updatesApplied = false;
      
      for (const challengeDoc of challengesSnapshot.docs) {
        const challenge = { id: challengeDoc.id, ...challengeDoc.data() };
        console.log(`Processing challenge: ${challenge.id} - ${challenge.name}`);
        
        // Find the user in the participants array
        const participantIndex = challenge.participants.findIndex(p => p.userId === userId);
        console.log(`Participant index for user ${userId}: ${participantIndex}`);
        
        if (participantIndex === -1) {
          console.log(`User ${userId} not found in challenge participants`);
          continue;
        }
        
        let shouldUpdate = false;
        
        // Update based on challenge type
        if (challenge.type === 'total_beers') {
          // Update total beers count
          console.log(`Updating total_beers challenge - before: ${challenge.participants[participantIndex].progress}`);
          challenge.participants[participantIndex].progress += 1;
          console.log(`After update: ${challenge.participants[participantIndex].progress}`);
          shouldUpdate = true;
        } 
        else if (challenge.type === 'unique_beers' && brandName) {
          // For unique beers challenges, check if we've already logged the brand
          const uniqueBrands = challenge.participants[participantIndex].loggedBrands || [];
          console.log(`Checking if brand "${brandName}" is in user's logged brands: [${uniqueBrands.join(', ')}]`);
          
          if (!uniqueBrands.includes(brandName)) {
            console.log(`Adding new unique brand "${brandName}" to challenge progress`);
            challenge.participants[participantIndex].progress += 1;
            
            // Update the logged brands for this challenge participant
            if (!challenge.participants[participantIndex].loggedBrands) {
              challenge.participants[participantIndex].loggedBrands = [];
            }
            challenge.participants[participantIndex].loggedBrands.push(brandName);
            shouldUpdate = true;
          } else {
            console.log(`Brand "${brandName}" already logged, not incrementing unique beers count`);
          }
        }
        else if (challenge.type === 'streak') {
          const today = new Date().toDateString();
          console.log(`Processing streak challenge for ${today}`);
          
          // Get current streak
          let currentStreak = challenge.participants[participantIndex].progress || 0;
          console.log(`Current streak: ${currentStreak}`);
          
          // Check when the participant last updated their streak
          const lastUpdated = challenge.participants[participantIndex].lastUpdated;
          let lastUpdatedDate;
          
          if (lastUpdated && lastUpdated.toDate) {
            lastUpdatedDate = lastUpdated.toDate().toDateString();
          } else if (lastUpdated) {
            lastUpdatedDate = new Date(lastUpdated).toDateString();
          } else {
            lastUpdatedDate = null;
          }
          
          console.log(`Last updated: ${lastUpdatedDate || 'never'}`);
          
          // Calculate yesterday's date
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toDateString();
          console.log(`Yesterday: ${yesterdayString}`);
          
          // If this is the first time logging a drink today
          if (lastUpdatedDate !== today) {
            if (lastUpdatedDate === yesterdayString) {
              // Continuing the streak
              console.log('Continuing streak');
              challenge.participants[participantIndex].progress += 1;
              shouldUpdate = true;
            } else if (!lastUpdatedDate || currentStreak === 0) {
              // Starting a new streak
              console.log('Starting new streak');
              challenge.participants[participantIndex].progress = 1;
              shouldUpdate = true;
            } else {
              // Streak broken - reset to 1
              console.log('Streak broken, resetting to 1');
              challenge.participants[participantIndex].progress = 1;
              shouldUpdate = true;
            }
          } else {
            console.log('Already logged a drink today, streak not updated');
          }
        }
        
        if (shouldUpdate) {
          console.log(`Updating challenge ${challenge.id}`);
          // Update the participant's lastUpdated timestamp
          challenge.participants[participantIndex].lastUpdated = new Date();
          
          // Add the update to the batch
          batch.update(doc(db, 'challenges', challenge.id), {
            participants: challenge.participants
          });
          updatesApplied = true;
        }
      }
      
      // Commit the batch if there are any updates
      if (updatesApplied) {
        console.log('Committing batch updates to challenges');
        await batch.commit();
        console.log('Successfully updated challenges');
      } else {
        console.log('No challenge updates to apply');
      }
    } catch (error) {
      console.error('Error updating challenges:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === 0) {
      // If "Other" is selected, don't update the amount yet
      setFormData(prev => ({ ...prev, amount: 0 }));
    } else {
      setFormData(prev => ({ ...prev, amount: selectedValue }));
      setCustomAmount(''); // Clear custom amount when selecting a preset size
    }
  };

  const handleCustomAmountChange = (event) => {
    const value = event.target.value;
    setCustomAmount(value);
    if (value && !isNaN(value)) {
      setFormData(prev => ({ ...prev, amount: Number(value) }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        pt: 10,
        px: 2,
      }}
    >
      {/* Background bubbles */}
      {bubbles.map(bubble => (
        <Bubble key={bubble.id} {...bubble} />
      ))}

      <Card
        className="glass-card"
        sx={{
          width: '100%',
          maxWidth: 500,
          p: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <IconButton
            sx={{
              width: 80,
              height: 80,
              mb: 2,
              background: 'var(--glass-background)',
              '&:hover': { background: 'var(--glass-background)' },
            }}
          >
            <BeerIcon sx={{ fontSize: 40, color: 'var(--beer-amber)' }} />
          </IconButton>
          <Typography variant="h4" className="logo-text" gutterBottom>
            Log Your Beer
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Autocomplete
            freeSolo
            options={previousBrands}
            value={formData.brand}
            onChange={(event, newValue) => {
              setFormData(prev => ({ ...prev, brand: newValue }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Beer Brand"
                name="brand"
                required
                sx={{ mb: 3 }}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              />
            )}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Beer Type</InputLabel>
            <Select
              name="drinkType"
              value={formData.drinkType}
              onChange={handleChange}
              required
              sx={{
                background: 'var(--glass-background)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <MenuItem value="lager">Lager</MenuItem>
              <MenuItem value="ale">Ale</MenuItem>
              <MenuItem value="ipa">IPA</MenuItem>
              <MenuItem value="stout">Stout</MenuItem>
              <MenuItem value="porter">Porter</MenuItem>
              <MenuItem value="wheat">Wheat Beer</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Container</InputLabel>
            <Select
              name="containerType"
              value={formData.containerType}
              onChange={handleChange}
              required
              sx={{
                background: 'var(--glass-background)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <MenuItem value="pint">Pint Glass</MenuItem>
              <MenuItem value="bottle">Bottle</MenuItem>
              <MenuItem value="can">Can</MenuItem>
              <MenuItem value="mug">Mug</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Amount</InputLabel>
            <Select
              value={formData.amount === 0 ? 0 : formData.amount}
              onChange={handleAmountChange}
              label="Amount"
            >
              {BEER_SIZES.map((size) => (
                <MenuItem key={size.value} value={size.value}>
                  {size.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {formData.amount === 0 && (
            <TextField
              fullWidth
              sx={{ mt: 2 }}
              label="Custom Amount (oz)"
              type="number"
              value={customAmount}
              onChange={handleCustomAmountChange}
              InputProps={{ inputProps: { min: 1 } }}
            />
          )}

          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography gutterBottom>Rating</Typography>
            <BeerRating
              name="rating"
              value={formData.rating}
              onChange={(e, value) => setFormData(prev => ({ ...prev, rating: value }))}
              icon={<StarIcon fontSize="inherit" />}
              size="large"
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            name="notes"
            label="Tasting Notes"
            value={formData.notes}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LocationIcon sx={{ color: location ? 'var(--beer-amber)' : 'var(--text-secondary)', mr: 1 }} />
            <Typography color={location ? 'var(--text-primary)' : 'var(--text-secondary)'}>
              {location ? 'Location captured' : 'Acquiring location...'}
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !location}
            sx={{
              background: 'var(--beer-amber)',
              color: 'var(--dark-wood)',
              '&:hover': {
                background: 'var(--copper)',
              },
            }}
          >
            {loading ? 'Logging...' : 'Log Beer'}
          </Button>
        </form>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="success"
          sx={{ 
            width: '100%',
            bgcolor: 'rgba(46, 125, 50, 0.9)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          🍺 Beer logged successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
} 