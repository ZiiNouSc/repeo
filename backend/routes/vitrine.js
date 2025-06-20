const express = require('express');
const router = express.Router();
const { 
  getVitrineConfig, 
  updateVitrineConfig, 
  toggleVitrineActive 
} = require('../controllers/vitrineController');
const { protect, agency } = require('../middlewares/authMiddleware');

// Get vitrine config
router.get('/', protect, agency, getVitrineConfig);

// Update vitrine config
router.put('/', protect, agency, updateVitrineConfig);

// Toggle vitrine active status
router.put('/toggle', protect, agency, toggleVitrineActive);

module.exports = router;