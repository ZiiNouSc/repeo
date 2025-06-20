const express = require('express');
const router = express.Router();
const { 
  getBillets, 
  getBilletById, 
  createBillet, 
  updateBillet, 
  deleteBillet,
  importBilletsFromGmail
} = require('../controllers/billetController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// Get all billets
router.get('/', protect, hasPermission('billets', 'lire'), getBillets);

// Get billet by ID
router.get('/:id', protect, hasPermission('billets', 'lire'), getBilletById);

// Create new billet
router.post('/', protect, hasPermission('billets', 'creer'), createBillet);

// Update billet
router.put('/:id', protect, hasPermission('billets', 'modifier'), updateBillet);

// Delete billet
router.delete('/:id', protect, hasPermission('billets', 'supprimer'), deleteBillet);

// Import billets from Gmail
router.post('/import-gmail', protect, hasPermission('billets', 'creer'), importBilletsFromGmail);

module.exports = router;