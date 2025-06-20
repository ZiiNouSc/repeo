const express = require('express');
const router = express.Router();
const { 
  getStats, 
  getSuperadminStats, 
  getAgenceStats 
} = require('../controllers/dashboardController');
const { protect, admin, agency } = require('../middlewares/authMiddleware');

// Get general dashboard stats
router.get('/stats', protect, getStats);

// Get superadmin dashboard stats
router.get('/superadmin/stats', protect, admin, getSuperadminStats);

// Get agence dashboard stats
router.get('/agence/stats', protect, agency, getAgenceStats);

module.exports = router;