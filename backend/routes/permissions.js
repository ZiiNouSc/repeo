const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');

// Get all modules
router.get('/modules', protect, (req, res) => {
  try {
    // This would typically come from a database
    const modules = [
      {
        id: 'clients',
        nom: 'Clients',
        description: 'Gestion des clients',
        permissions: ['lire', 'creer', 'modifier', 'supprimer']
      },
      {
        id: 'factures',
        nom: 'Factures',
        description: 'Gestion des factures',
        permissions: ['lire', 'creer', 'modifier', 'supprimer']
      },
      {
        id: 'reservations',
        nom: 'Réservations',
        description: 'Gestion des réservations',
        permissions: ['lire', 'creer', 'modifier', 'supprimer']
      },
      {
        id: 'caisse',
        nom: 'Caisse',
        description: 'Gestion de caisse',
        permissions: ['lire', 'creer', 'modifier', 'supprimer']
      },
      {
        id: 'packages',
        nom: 'Packages',
        description: 'Gestion des packages',
        permissions: ['lire', 'creer', 'modifier', 'supprimer']
      },
      {
        id: 'billets',
        nom: 'Billets',
        description: 'Gestion des billets',
        permissions: ['lire', 'creer', 'modifier', 'supprimer']
      },
      {
        id: 'documents',
        nom: 'Documents',
        description: 'Gestion des documents',
        permissions: ['lire', 'creer', 'modifier', 'supprimer']
      },
      {
        id: 'crm',
        nom: 'CRM',
        description: 'Gestion des contacts',
        permissions: ['lire', 'creer', 'modifier', 'supprimer']
      },
      {
        id: 'rapports',
        nom: 'Rapports',
        description: 'Accès aux rapports',
        permissions: ['lire', 'exporter']
      }
    ];
    
    res.status(200).json({
      success: true,
      data: modules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des modules',
      error: error.message
    });
  }
});

// Get user permissions
router.get('/users', protect, admin, (req, res) => {
  try {
    // In a real app, this would come from the database
    const userPermissions = [
      {
        userId: '1',
        userName: 'Admin Système',
        userRole: 'superadmin',
        modules: [
          { moduleId: 'clients', permissions: ['lire', 'creer', 'modifier', 'supprimer'] },
          { moduleId: 'factures', permissions: ['lire', 'creer', 'modifier', 'supprimer'] }
        ]
      },
      {
        userId: '2',
        userName: 'Sophie Martin',
        userRole: 'agence',
        modules: [
          { moduleId: 'clients', permissions: ['lire', 'creer', 'modifier', 'supprimer'] },
          { moduleId: 'factures', permissions: ['lire', 'creer', 'modifier', 'supprimer'] }
        ]
      },
      {
        userId: '3',
        userName: 'Jean Dupont',
        userRole: 'agent',
        modules: [
          { moduleId: 'clients', permissions: ['lire', 'creer'] },
          { moduleId: 'factures', permissions: ['lire'] }
        ]
      }
    ];
    
    res.status(200).json({
      success: true,
      data: userPermissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des permissions utilisateurs',
      error: error.message
    });
  }
});

// Update user permissions
router.put('/users/:userId', protect, admin, (req, res) => {
  try {
    const { userId } = req.params;
    const { modules } = req.body;
    
    if (!modules) {
      return res.status(400).json({
        success: false,
        message: 'Modules manquants'
      });
    }
    
    // In a real app, this would update the user's permissions in the database
    
    res.status(200).json({
      success: true,
      message: 'Permissions mises à jour avec succès',
      data: { userId, modules }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des permissions',
      error: error.message
    });
  }
});

module.exports = router;