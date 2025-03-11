const mongoose = require('mongoose');

const containerTypes = [
  'can', 
  'bottle', 
  'solo cup', 
  'shotgun', 
  'funnel', 
  'pint glass', 
  'martini glass', 
  'wine glass',
  'other'
];

const DrinkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drinkName: {
    type: String,
    required: [true, 'Drink name is required'],
    trim: true
  },
  container: {
    type: String,
    enum: containerTypes,
    required: [true, 'Container type is required']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create geospatial index
DrinkSchema.index({ location: '2dsphere' });

// Static method to get all drinks for a user
DrinkSchema.statics.getByUser = function(userId) {
  return this.find({ user: userId }).sort({ timestamp: -1 });
};

// Static method to get drinks with filters
DrinkSchema.statics.getWithFilters = function(userId, filters = {}) {
  const query = { user: userId };
  
  // Apply filters
  if (filters.drinkName) {
    query.drinkName = { $regex: filters.drinkName, $options: 'i' };
  }
  
  if (filters.container) {
    query.container = filters.container;
  }
  
  if (filters.rating) {
    query.rating = filters.rating;
  }
  
  if (filters.startDate && filters.endDate) {
    query.timestamp = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  } else if (filters.startDate) {
    query.timestamp = { $gte: new Date(filters.startDate) };
  } else if (filters.endDate) {
    query.timestamp = { $lte: new Date(filters.endDate) };
  }
  
  return this.find(query).sort({ timestamp: -1 });
};

const Drink = mongoose.model('Drink', DrinkSchema);

module.exports = Drink; 