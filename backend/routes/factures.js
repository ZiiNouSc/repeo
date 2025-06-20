const express = require('express');
const router = express.Router();
const { 
  getFactures, 
  getFactureById, 
  createFacture, 
  updateFacture, 
  markFactureAsPaid, 
  deleteFacture,
  generateFacturePDF
} = require('../controllers/factureController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// Get all factures
router.get('/', protect, hasPermission('factures', 'lire'), getFactures);

// Get facture by ID
router.get('/:id', protect, hasPermission('factures', 'lire'), getFactureById);

// Create new facture
router.post('/', protect, hasPermission('factures', 'creer'), createFacture);

// Update facture
router.put('/:id', protect, hasPermission('factures', 'modifier'), updateFacture);

// Mark facture as paid
router.put('/:id/pay', protect, hasPermission('factures', 'modifier'), markFactureAsPaid);

// Delete facture
router.delete('/:id', protect, hasPermission('factures', 'supprimer'), deleteFacture);

// Generate PDF for facture
router.get('/:id/pdf', protect, hasPermission('factures', 'lire'), generateFacturePDF);

module.exports = router;