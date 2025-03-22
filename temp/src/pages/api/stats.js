import { db } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { parseISO, format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userId,
      startDate,
      endDate,
      timeUnit = 'day',
      location,
    } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // Query drinks from Firestore
    const drinksQuery = query(
      collection(db, 'drinks'),
      where('userId', '==', userId),
      where('timestamp', '>=', startOfDay(start)),
      where('timestamp', '<=', endOfDay(end)),
      orderBy('timestamp', 'desc')
    );

    const drinksSnapshot = await getDocs(drinksQuery);
    const drinks = drinksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by location if specified
    let filteredDrinks = drinks;
    if (location) {
      const locationData = JSON.parse(location);
      filteredDrinks = drinks.filter(drink => {
        if (!drink.placeInfo) return false;
        switch (locationData.type) {
          case 'city':
            return drink.placeInfo.city === locationData.value;
          case 'state':
            return drink.placeInfo.state === locationData.value;
          case 'country':
            return drink.placeInfo.country === locationData.value;
          default:
            return false;
        }
      });
    }

    // Group data by time unit
    const groupedData = filteredDrinks.reduce((acc, drink) => {
      let timeKey;
      const date = new Date(drink.timestamp);

      switch (timeUnit) {
        case 'week':
          timeKey = format(startOfWeek(date), 'yyyy-MM-dd');
          break;
        case 'month':
          timeKey = format(startOfMonth(date), 'yyyy-MM');
          break;
        default: // day
          timeKey = format(date, 'yyyy-MM-dd');
      }

      if (!acc[timeKey]) {
        acc[timeKey] = {
          date: timeKey,
          total: 0,
          unique: new Set(),
          ratings: [],
        };
      }

      acc[timeKey].total += 1;
      acc[timeKey].unique.add(drink.brand);
      if (drink.rating) {
        acc[timeKey].ratings.push(drink.rating);
      }

      return acc;
    }, {});

    // Calculate final statistics
    const stats = Object.entries(groupedData).map(([date, data]) => ({
      date,
      total: data.total,
      unique: data.unique.size,
      rating: data.ratings.length > 0
        ? (data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(1)
        : null,
    }));

    // Sort by date
    stats.sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 