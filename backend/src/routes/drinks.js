const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Drink = require('../models/Drink');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/drinks
// @desc    Log a new drink
// @access  Private
router.post('/', [
  auth,
  body('drinkName').not().isEmpty().trim(),
  body('container').not().isEmpty().trim(),
  body('location.coordinates').isArray().withMessage('Coordinates must be an array [longitude, latitude]'),
  body('rating').optional().isInt({ min: 1, max: 5 })
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { drinkName, container, location, rating } = req.body;

    // Create new drink log
    const newDrink = new Drink({
      user: req.user.id,
      drinkName,
      container,
      location,
      rating: rating || 3
    });

    const drink = await newDrink.save();

    // Add drink to user's previous drinks list
    const user = await User.findById(req.user.id);
    await user.addToPreviousDrinks(drinkName);

    res.json(drink);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/drinks
// @desc    Get all drinks for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const drinks = await Drink.getByUser(req.user.id);
    res.json(drinks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/drinks/filter
// @desc    Get filtered drinks for a user
// @access  Private
router.get('/filter', auth, async (req, res) => {
  try {
    const filters = req.query;
    const drinks = await Drink.getWithFilters(req.user.id, filters);
    res.json(drinks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/drinks/previous
// @desc    Get user's previous drink names for autocomplete
// @access  Private
router.get('/previous', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.previousDrinks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/drinks/export
// @desc    Export user's drinks as CSV
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const drinks = await Drink.getByUser(req.user.id);
    
    // Create CSV header
    let csv = 'Drink Name,Container,Rating,Latitude,Longitude,Timestamp\n';
    
    // Add rows
    drinks.forEach(drink => {
      const row = [
        `"${drink.drinkName}"`,
        drink.container,
        drink.rating,
        drink.location.coordinates[1], // Latitude
        drink.location.coordinates[0], // Longitude
        new Date(drink.timestamp).toISOString()
      ].join(',');
      
      csv += row + '\n';
    });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=drink-logs.csv');
    
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/drinks/:id
// @desc    Get drink by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const drink = await Drink.findById(req.params.id);
    
    // Check if drink exists
    if (!drink) {
      return res.status(404).json({ msg: 'Drink not found' });
    }
    
    // Check user owns the drink
    if (drink.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(drink);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Drink not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/drinks/:id
// @desc    Delete a drink
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const drink = await Drink.findById(req.params.id);
    
    // Check if drink exists
    if (!drink) {
      return res.status(404).json({ msg: 'Drink not found' });
    }
    
    // Check user owns the drink
    if (drink.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await drink.remove();
    
    res.json({ msg: 'Drink removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Drink not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 