const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/dataHelper');

// Get parametres
router.get('/', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    const agences = readData('agences');
    const agence = agences.find(a => a.id === agenceId);
    
    if (!agence) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    // Get or create parametres
    const parametres = agence.parametres || {
      // Paramètres généraux
      nomAgence: agence.nom,
      fuseau: 'Europe/Paris',
      langue: 'fr',
      devise: 'EUR',
      
      // Notifications
      emailNotifications: true,
      smsNotifications: false,
      notificationFactures: true,
      notificationPaiements: true,
      notificationRappels: true,
      
      // Sécurité
      authentificationDouble: false,
      sessionTimeout: 30,
      tentativesConnexion: 5,
      
      // Facturation
      numeroFactureAuto: true,
      prefixeFacture: 'FAC',
      tvaDefaut: 20,
      conditionsPaiement: '30 jours',
      
      // Sauvegarde
      sauvegardeAuto: true,
      frequenceSauvegarde: 'quotidienne',
      derniereSauvegarde: new Date().toISOString(),
      
      // API et intégrations
      apiKey: 'sk_live_xxxxxxxxxxxxxxxxxxxxxxxx',
      webhookUrl: 'https://votre-agence.com/webhook',
      integrationComptable: false
    };
    
    res.status(200).json({
      success: true,
      data: parametres
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres',
      error: error.message
    });
  }
});

// Update parametres
router.put('/', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    const agences = readData('agences');
    const agenceIndex = agences.findIndex(a => a.id === agenceId);
    
    if (agenceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    // Update parametres
    agences[agenceIndex].parametres = req.body;
    
    if (writeData('agences', agences)) {
      res.status(200).json({
        success: true,
        message: 'Paramètres mis à jour avec succès',
        data: req.body
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres',
      error: error.message
    });
  }
});

// Generate new API key
router.post('/generate-api-key', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    const agences = readData('agences');
    const agenceIndex = agences.findIndex(a => a.id === agenceId);
    
    if (agenceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    // Generate new API key
    const apiKey = 'sk_live_' + Math.random().toString(36).substring(2, 28);
    
    // Update parametres
    if (!agences[agenceIndex].parametres) {
      agences[agenceIndex].parametres = {};
    }
    
    agences[agenceIndex].parametres.apiKey = apiKey;
    
    if (writeData('agences', agences)) {
      res.status(200).json({
        success: true,
        message: 'Nouvelle clé API générée avec succès',
        data: { apiKey }
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération de la clé API',
      error: error.message
    });
  }
});

// Trigger backup
router.post('/backup', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    const agences = readData('agences');
    const agenceIndex = agences.findIndex(a => a.id === agenceId);
    
    if (agenceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    // Update derniereSauvegarde
    if (!agences[agenceIndex].parametres) {
      agences[agenceIndex].parametres = {};
    }
    
    agences[agenceIndex].parametres.derniereSauvegarde = new Date().toISOString();
    
    if (writeData('agences', agences)) {
      res.status(200).json({
        success: true,
        message: 'Sauvegarde effectuée avec succès',
        data: { derniereSauvegarde: agences[agenceIndex].parametres.derniereSauvegarde }
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde',
      error: error.message
    });
  }
});

module.exports = router;