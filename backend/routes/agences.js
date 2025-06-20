const express = require('express');
const router = express.Router();
const { 
  getAgences, 
  getAgenceById, 
  createAgence,
  approveAgence, 
  rejectAgence, 
  suspendAgence, 
  updateAgenceModules 
} = require('../controllers/agenceController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Get all agences
router.get('/', protect, admin, getAgences);

// Get agence by ID
router.get('/:id', protect, admin, getAgenceById);

// Create new agence
router.post('/', protect, admin, createAgence);

// Approve agence
router.put('/:id/approve', protect, admin, approveAgence);

// Reject agence
router.put('/:id/reject', protect, admin, rejectAgence);

// Suspend agence
router.put('/:id/suspend', protect, admin, suspendAgence);

// Update agence modules
router.put('/:id/modules', protect, admin, updateAgenceModules);

module.exports = router;