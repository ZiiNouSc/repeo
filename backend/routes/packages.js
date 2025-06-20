const express = require('express');
const router = express.Router();
const { 
  getPackages, 
  getPublicPackages, 
  getPackageById, 
  createPackage, 
  updatePackage, 
  togglePackageVisibility, 
  deletePackage 
} = require('../controllers/packageController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// Get all packages
router.get('/', protect, hasPermission('packages', 'lire'), getPackages);

// Get public packages (visible only)
router.get('/public', getPublicPackages);

// Get package by ID
router.get('/:id', protect, hasPermission('packages', 'lire'), getPackageById);

// Create new package
router.post('/', protect, hasPermission('packages', 'creer'), createPackage);

// Update package
router.put('/:id', protect, hasPermission('packages', 'modifier'), updatePackage);

// Toggle package visibility
router.put('/:id/toggle-visibility', protect, hasPermission('packages', 'modifier'), togglePackageVisibility);

// Delete package
router.delete('/:id', protect, hasPermission('packages', 'supprimer'), deletePackage);

module.exports = router;