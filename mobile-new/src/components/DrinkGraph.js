import React, { useState, useMemo } from 'react';
import { View, Dimensions, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, useTheme as usePaperTheme } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { Calendar } from 'react-native-calendars';
import { format, subDays, subMonths, startOfDay } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const screenWidth = Dimensions.get('window').width;

const timeFrameOptions = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: '3months', label: '3 Months' },
  { value: 'year', label: 'Year' },
];

const metricOptions = [
  { value: 'total', label: 'Total Drinks' },
  { value: 'unique', label: 'Unique Beers' },
  { value: 'rating', label: 'Average Rating' },
  { value: 'volume', label: 'Volume (oz)' },
];

const chartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: theme.colors.beer.dark,
  backgroundGradientTo: theme.colors.beer.darkWood,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(251, 192, 45, ${opacity})`,
  labelColor: () => theme.colors.text.primary,
  style: {
    borderRadius: theme.borderRadius.lg,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: theme.colors.beer.copper,
  },
  propsForBackgroundLines: {
    stroke: 'rgba(255, 255, 255, 0.1)',
  },
  propsForLabels: {
    fontFamily: theme.fonts.regular,
  },
};

const FilterButton = ({ label, value, options, onChange }) => {
  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterButtons}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              value === option.value && styles.filterButtonActive,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(option.value);
            }}
          >
            <Text
              style={[
                styles.filterButtonText,
                value === option.value && styles.filterButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function DrinkGraph({ drinks }) {
  const [viewType, setViewType] = useState('bar');
  const [timeFrame, setTimeFrame] = useState('month');
  const [metric, setMetric] = useState('total');
  const [currentDate, setCurrentDate] = useState(new Date());

  const processedData = useMemo(() => {
    if (!drinks || drinks.length === 0) {
      return {
        bar: {
          labels: [],
          datasets: [{ data: [] }],
        },
        calendar: {},
      };
    }

    const now = new Date();
    let startDate = new Date();
    
    switch (timeFrame) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case 'year':
        startDate = subMonths(now, 12);
        break;
    }

    startDate = startOfDay(startDate);

    // Filter drinks by time frame
    const filteredDrinks = drinks.filter(drink => {
      const drinkDate = new Date(drink.timestamp);
      return drinkDate >= startDate && drinkDate <= now;
    });

    // Group drinks by day
    const groups = {};
    filteredDrinks.forEach(drink => {
      const date = format(new Date(drink.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = {
          count: 0,
          uniqueBeers: new Set(),
          totalRating: 0,
          ratingCount: 0,
          volume: 0,
        };
      }
      groups[date].count++;
      groups[date].uniqueBeers.add(drink.brand);
      if (drink.rating) {
        groups[date].totalRating += drink.rating;
        groups[date].ratingCount++;
      }
      groups[date].volume += drink.amount || 0;
    });

    // Create data points
    const data = Object.entries(groups).map(([date, stats]) => {
      let value;
      switch (metric) {
        case 'total':
          value = stats.count;
          break;
        case 'unique':
          value = stats.uniqueBeers.size;
          break;
        case 'rating':
          value = stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0;
          break;
        case 'volume':
          value = stats.volume;
          break;
        default:
          value = stats.count;
      }
      return { date, value };
    });

    // Sort by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Find max value for heat map intensity
    const maxValue = Math.max(...data.map(d => d.value));

    return {
      bar: {
        labels: data.map(d => format(new Date(d.date), 'MMM d')),
        datasets: [{
          data: data.map(d => d.value),
        }],
      },
      calendar: data.reduce((acc, d) => {
        const intensity = d.value / maxValue;
        acc[d.date] = {
          marked: true,
          selected: true,
          selectedColor: `rgba(251, 192, 45, ${Math.max(0.2, intensity)})`,
        };
        return acc;
      }, {}),
    };
  }, [drinks, timeFrame, metric]);

  const handleViewTypeChange = () => {
    Haptics.selectionAsync();
    setViewType(viewType === 'bar' ? 'calendar' : 'bar');
  };

  return (
    <View style={styles.cardWrapper}>
      <Card style={styles.card}>
        <LinearGradient
          colors={[theme.colors.beer.dark, theme.colors.beer.darkWood]}
          style={styles.cardGradient}
        >
          <Card.Content>
            <View style={styles.header}>
              <Text style={styles.title}>Drink Analytics</Text>
              <IconButton
                icon={viewType === 'bar' ? 'calendar' : 'chart-bar'}
                iconColor={theme.colors.beer.amber}
                size={24}
                onPress={handleViewTypeChange}
              />
            </View>

            <View style={styles.filters}>
              <FilterButton
                label="Time Frame"
                value={timeFrame}
                options={timeFrameOptions}
                onChange={setTimeFrame}
              />
              <FilterButton
                label="Metric"
                value={metric}
                options={metricOptions}
                onChange={setMetric}
              />
            </View>

            <ScrollView
              horizontal={viewType === 'bar'}
              showsHorizontalScrollIndicator={false}
              style={styles.chartContainer}
            >
              {viewType === 'bar' ? (
                <BarChart
                  data={processedData.bar}
                  width={Math.max(screenWidth - 32, processedData.bar.labels.length * 50)}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  showBarTops={false}
                  fromZero
                  withInnerLines={false}
                  showValuesOnTopOfBars
                />
              ) : (
                <View style={styles.calendarContainer}>
                  <Calendar
                    current={format(currentDate, 'yyyy-MM-dd')}
                    markedDates={processedData.calendar}
                    theme={{
                      calendarBackground: theme.colors.beer.dark,
                      textSectionTitleColor: theme.colors.text.primary,
                      selectedDayBackgroundColor: theme.colors.beer.amber,
                      selectedDayTextColor: theme.colors.beer.dark,
                      todayTextColor: theme.colors.beer.amber,
                      dayTextColor: theme.colors.text.primary,
                      textDisabledColor: theme.colors.text.secondary,
                      dotColor: theme.colors.beer.amber,
                      monthTextColor: theme.colors.text.primary,
                      textMonthFontFamily: theme.fonts.medium,
                      textDayFontFamily: theme.fonts.regular,
                      textDayHeaderFontFamily: theme.fonts.medium,
                      arrowColor: theme.colors.beer.amber,
                    }}
                    enableSwipeMonths={true}
                    onMonthChange={(month) => {
                      setCurrentDate(new Date(month.timestamp));
                    }}
                  />
                </View>
              )}
            </ScrollView>
          </Card.Content>
        </LinearGradient>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    margin: 8,
    borderRadius: theme.borderRadius.lg,
    elevation: 4,
    shadowColor: theme.colors.beer.amber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  card: {
    backgroundColor: theme.colors.beer.dark,
    borderColor: theme.colors.beer.amber,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
  },
  cardGradient: {
    borderRadius: theme.borderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.beer.amber,
  },
  filters: {
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.beer.amber,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.beer.amber,
  },
  filterButtonText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
  },
  filterButtonTextActive: {
    color: theme.colors.beer.dark,
    fontFamily: theme.fonts.medium,
  },
  chartContainer: {
    marginTop: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: theme.borderRadius.lg,
  },
  calendarContainer: {
    width: screenWidth - 32,
  },
}); 