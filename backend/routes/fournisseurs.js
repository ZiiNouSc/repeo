const express = require('express');
const router = express.Router();
const { 
  getFournisseurs, 
  getFournisseurById, 
  createFournisseur, 
  updateFournisseur, 
  deleteFournisseur 
} = require('../controllers/fournisseurController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// Get all fournisseurs
router.get('/', protect, hasPermission('fournisseurs', 'lire'), getFournisseurs);

// Get fournisseur by ID
router.get('/:id', protect, hasPermission('fournisseurs', 'lire'), getFournisseurById);

// Create new fournisseur
router.post('/', protect, hasPermission('fournisseurs', 'creer'), createFournisseur);

// Update fournisseur
router.put('/:id', protect, hasPermission('fournisseurs', 'modifier'), updateFournisseur);

// Delete fournisseur
router.delete('/:id', protect, hasPermission('fournisseurs', 'supprimer'), deleteFournisseur);

module.exports = router;