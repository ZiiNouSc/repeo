const asyncHandler = require('express-async-handler');
const Agence = require('../models/agenceModel');
const crypto = require('crypto');

// @desc    Get parametres
// @route   GET /api/parametres
// @access  Private/Agency
const getParametres = asyncHandler(async (req, res) => {
  // Get agenceId from authenticated user
  const agenceId = req.user?.agenceId;
  
  if (!agenceId) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'agence manquant'
    });
  }
  
  const agence = await Agence.findById(agenceId);
  
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
  
  // Get or create parametres
  if (!agence.parametres) {
    agence.parametres = {
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
      apiKey: 'sk_live_' + crypto.randomBytes(12).toString('hex'),
      webhookUrl: 'https://votre-agence.com/webhook',
      integrationComptable: false
    };
    
    await agence.save();
  }
  
  res.status(200).json({
    success: true,
    data: agence.parametres
  });
});

// @desc    Update parametres
// @route   PUT /api/parametres
// @access  Private/Agency
const updateParametres = asyncHandler(async (req, res) => {
  // Get agenceId from authenticated user
  const agenceId = req.user?.agenceId;
  
  if (!agenceId) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'agence manquant'
    });
  }
  
  const agence = await Agence.findById(agenceId);
  
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
  
  // Update parametres
  agence.parametres = req.body;
  await agence.save();
  
  res.status(200).json({
    success: true,
    message: 'Paramètres mis à jour avec succès',
    data: agence.parametres
  });
});

// @desc    Generate new API key
// @route   POST /api/parametres/generate-api-key
// @access  Private/Agency
const generateApiKey = asyncHandler(async (req, res) => {
  // Get agenceId from authenticated user
  const agenceId = req.user?.agenceId;
  
  if (!agenceId) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'agence manquant'
    });
  }
  
  const agence = await Agence.findById(agenceId);
  
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
  
  // Generate new API key
  const apiKey = 'sk_live_' + crypto.randomBytes(12).toString('hex');
  
  // Update parametres
  if (!agence.parametres) {
    agence.parametres = {};
  }
  
  agence.parametres.apiKey = apiKey;
  await agence.save();
  
  res.status(200).json({
    success: true,
    message: 'Nouvelle clé API générée avec succès',
    data: { apiKey }
  });
});

// @desc    Trigger backup
// @route   POST /api/parametres/backup
// @access  Private/Agency
const triggerBackup = asyncHandler(async (req, res) => {
  // Get agenceId from authenticated user
  const agenceId = req.user?.agenceId;
  
  if (!agenceId) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'agence manquant'
    });
  }
  
  const agence = await Agence.findById(agenceId);
  
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
  
  // Update derniereSauvegarde
  if (!agence.parametres) {
    agence.parametres = {};
  }
  
  agence.parametres.derniereSauvegarde = new Date().toISOString();
  await agence.save();
  
  res.status(200).json({
    success: true,
    message: 'Sauvegarde effectuée avec succès',
    data: { derniereSauvegarde: agence.parametres.derniereSauvegarde }
  });
});

module.exports = {
  getParametres,
  updateParametres,
  generateApiKey,
  triggerBackup
};