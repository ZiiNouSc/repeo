const express = require('express');
const router = express.Router();
const { 
  getOperations, 
  getSolde, 
  createOperation, 
  updateOperation, 
  deleteOperation 
} = require('../controllers/caisseController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// Get all operations
router.get('/operations', protect, hasPermission('caisse', 'lire'), getOperations);

// Get caisse solde
router.get('/solde', protect, hasPermission('caisse', 'lire'), getSolde);

// Create new operation
router.post('/operations', protect, hasPermission('caisse', 'creer'), createOperation);

// Update operation
router.put('/operations/:id', protect, hasPermission('caisse', 'modifier'), updateOperation);

// Delete operation
router.delete('/operations/:id', protect, hasPermission('caisse', 'supprimer'), deleteOperation);

module.exports = router;