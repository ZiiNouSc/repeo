const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  updateLogo 
} = require('../controllers/profileController');
const { protect, agency } = require('../middlewares/authMiddleware');

// Get profile
router.get('/', protect, agency, getProfile);

// Update profile
router.put('/', protect, agency, updateProfile);

// Update logo
router.post('/logo', protect, agency, updateLogo);

module.exports = router;