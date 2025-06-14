const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/dataHelper');

// Get all modules
router.get('/modules', (req, res) => {
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
router.get('/users', (req, res) => {
  try {
    const users = readData('users');
    const agents = readData('agents');
    
    // Create user permissions array
    const userPermissions = users
      .filter(user => user.role !== 'superadmin') // Exclude superadmin as they have all permissions
      .map(user => {
        // For agents, get permissions from agents collection
        let modules = [];
        if (user.role === 'agent') {
          const agent = agents.find(a => a.email === user.email);
          if (agent) {
            modules = agent.permissions;
          }
        } else if (user.role === 'agence') {
          // For agencies, they have all permissions on their active modules
          const agence = readData('agences').find(a => a.id === user.agenceId);
          if (agence) {
            modules = agence.modulesActifs.map(moduleId => ({
              moduleId,
              permissions: ['lire', 'creer', 'modifier', 'supprimer']
            }));
          }
        }
        
        return {
          userId: user.id,
          userName: `${user.prenom} ${user.nom}`,
          userRole: user.role,
          modules
        };
      });
    
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
router.put('/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { modules } = req.body;
    
    if (!modules) {
      return res.status(400).json({
        success: false,
        message: 'Modules manquants'
      });
    }
    
    const users = readData('users');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Update permissions based on user role
    if (user.role === 'agent') {
      const agents = readData('agents');
      const agentIndex = agents.findIndex(a => a.email === user.email);
      
      if (agentIndex !== -1) {
        agents[agentIndex].permissions = modules;
        
        if (writeData('agents', agents)) {
          // Also update user permissions
          user.permissions = modules;
          writeData('users', users);
          
          res.status(200).json({
            success: true,
            message: 'Permissions mises à jour avec succès',
            data: { userId, modules }
          });
        } else {
          throw new Error('Erreur lors de l\'écriture des données');
        }
      } else {
        return res.status(404).json({
          success: false,
          message: 'Agent non trouvé'
        });
      }
    } else if (user.role === 'agence') {
      const agences = readData('agences');
      const agenceIndex = agences.findIndex(a => a.id === user.agenceId);
      
      if (agenceIndex !== -1) {
        // For agencies, we update their active modules
        agences[agenceIndex].modulesActifs = modules.map(m => m.moduleId);
        
        if (writeData('agences', agences)) {
          res.status(200).json({
            success: true,
            message: 'Modules mis à jour avec succès',
            data: { userId, modules }
          });
        } else {
          throw new Error('Erreur lors de l\'écriture des données');
        }
      } else {
        return res.status(404).json({
          success: false,
          message: 'Agence non trouvée'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Impossible de modifier les permissions pour ce type d\'utilisateur'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des permissions',
      error: error.message
    });
  }
});

module.exports = router;