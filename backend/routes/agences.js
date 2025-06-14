const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all agences
router.get('/', (req, res) => {
  try {
    const agences = readData('agences');
    res.status(200).json({
      success: true,
      data: agences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des agences',
      error: error.message
    });
  }
});

// Get agence by ID
router.get('/:id', (req, res) => {
  try {
    const agences = readData('agences');
    const agence = agences.find(a => a.id === req.params.id);
    
    if (!agence) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: agence
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'agence',
      error: error.message
    });
  }
});

// Approve agence
router.put('/:id/approve', (req, res) => {
  try {
    const agences = readData('agences');
    const agenceIndex = agences.findIndex(a => a.id === req.params.id);
    
    if (agenceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    agences[agenceIndex].statut = 'approuve';
    
    if (writeData('agences', agences)) {
      // Update user status
      const users = readData('users');
      const userIndex = users.findIndex(u => u.agenceId === agences[agenceIndex].id);
      
      if (userIndex !== -1) {
        users[userIndex].statut = 'actif';
        writeData('users', users);
      }
      
      res.status(200).json({
        success: true,
        message: 'Agence approuvée avec succès',
        data: agences[agenceIndex]
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation de l\'agence',
      error: error.message
    });
  }
});

// Reject agence
router.put('/:id/reject', (req, res) => {
  try {
    const agences = readData('agences');
    const agenceIndex = agences.findIndex(a => a.id === req.params.id);
    
    if (agenceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    agences[agenceIndex].statut = 'rejete';
    
    if (writeData('agences', agences)) {
      // Update user status
      const users = readData('users');
      const userIndex = users.findIndex(u => u.agenceId === agences[agenceIndex].id);
      
      if (userIndex !== -1) {
        users[userIndex].statut = 'rejete';
        writeData('users', users);
      }
      
      res.status(200).json({
        success: true,
        message: 'Agence rejetée avec succès',
        data: agences[agenceIndex]
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet de l\'agence',
      error: error.message
    });
  }
});

// Suspend agence
router.put('/:id/suspend', (req, res) => {
  try {
    const agences = readData('agences');
    const agenceIndex = agences.findIndex(a => a.id === req.params.id);
    
    if (agenceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    agences[agenceIndex].statut = 'suspendu';
    
    if (writeData('agences', agences)) {
      // Update user status
      const users = readData('users');
      const userIndex = users.findIndex(u => u.agenceId === agences[agenceIndex].id);
      
      if (userIndex !== -1) {
        users[userIndex].statut = 'suspendu';
        writeData('users', users);
      }
      
      res.status(200).json({
        success: true,
        message: 'Agence suspendue avec succès',
        data: agences[agenceIndex]
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suspension de l\'agence',
      error: error.message
    });
  }
});

// Update agence modules
router.put('/:id/modules', (req, res) => {
  try {
    const { modules } = req.body;
    
    if (!modules || !Array.isArray(modules)) {
      return res.status(400).json({
        success: false,
        message: 'Liste de modules manquante ou invalide'
      });
    }
    
    const agences = readData('agences');
    const agenceIndex = agences.findIndex(a => a.id === req.params.id);
    
    if (agenceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    agences[agenceIndex].modulesActifs = modules;
    
    if (writeData('agences', agences)) {
      res.status(200).json({
        success: true,
        message: 'Modules mis à jour avec succès',
        data: agences[agenceIndex]
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des modules',
      error: error.message
    });
  }
});

module.exports = router;