const express = require('express');
const router = express.Router();
const { 
  getParametres, 
  updateParametres, 
  generateApiKey, 
  triggerBackup 
} = require('../controllers/parametresController');
const { protect, agency } = require('../middlewares/authMiddleware');

// Get parametres
router.get('/', protect, agency, getParametres);

// Update parametres
router.put('/', protect, agency, updateParametres);

// Generate new API key
router.post('/generate-api-key', protect, agency, generateApiKey);

// Trigger backup
router.post('/backup', protect, agency, triggerBackup);

module.exports = router;