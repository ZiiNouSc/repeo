const express = require('express');
const router = express.Router();
const { 
  getModuleRequests, 
  getAgencyModuleRequests, 
  createModuleRequest, 
  processModuleRequest 
} = require('../controllers/moduleRequestController');
const { protect, admin, agency } = require('../middlewares/authMiddleware');

// Get all module requests (admin only)
router.get('/', protect, admin, getModuleRequests);

// Get agency module requests
router.get('/agency', protect, agency, getAgencyModuleRequests);

// Create new module request
router.post('/', protect, agency, createModuleRequest);

// Process module request (approve/reject)
router.put('/:id/process', protect, admin, processModuleRequest);

module.exports = router;