const express = require('express');
const router = express.Router();
const { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getUserProfile 
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Login route
router.post('/login', loginUser);

// Register route
router.post('/register', registerUser);

// Logout route
router.post('/logout', logoutUser);

// Get current user route
router.get('/me', protect, getUserProfile);

module.exports = router;