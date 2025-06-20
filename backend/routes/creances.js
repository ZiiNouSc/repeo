const express = require('express');
const router = express.Router();
const { 
  getCreances, 
  sendReminder, 
  getCreanceStats 
} = require('../controllers/creanceController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// Get all creances
router.get('/', protect, hasPermission('factures', 'lire'), getCreances);

// Send reminder for a creance
router.post('/:id/reminder', protect, hasPermission('factures', 'modifier'), sendReminder);

// Get creance statistics
router.get('/stats', protect, hasPermission('factures', 'lire'), getCreanceStats);

module.exports = router;