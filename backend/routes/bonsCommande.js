const express = require('express');
const router = express.Router();
const { 
  getBonsCommande, 
  getBonCommandeById, 
  createBonCommande, 
  updateBonCommande, 
  convertBonCommandeToFacture, 
  deleteBonCommande 
} = require('../controllers/bonCommandeController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// Get all bons de commande
router.get('/', protect, hasPermission('bons-commande', 'lire'), getBonsCommande);

// Get bon de commande by ID
router.get('/:id', protect, hasPermission('bons-commande', 'lire'), getBonCommandeById);

// Create new bon de commande
router.post('/', protect, hasPermission('bons-commande', 'creer'), createBonCommande);

// Update bon de commande
router.put('/:id', protect, hasPermission('bons-commande', 'modifier'), updateBonCommande);

// Convert bon de commande to facture
router.post('/:id/convert', protect, hasPermission('factures', 'creer'), convertBonCommandeToFacture);

// Delete bon de commande
router.delete('/:id', protect, hasPermission('bons-commande', 'supprimer'), deleteBonCommande);

module.exports = router;