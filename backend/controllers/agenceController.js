const asyncHandler = require('express-async-handler');
const Agence = require('../models/agenceModel');
const User = require('../models/userModel');

// @desc    Get all agencies
// @route   GET /api/agences
// @access  Private/Admin
const getAgences = asyncHandler(async (req, res) => {
  const agences = await Agence.find({});
  
  res.status(200).json({
    success: true,
    data: agences
  });
});

// @desc    Get agency by ID
// @route   GET /api/agences/:id
// @access  Private/Admin
const getAgenceById = asyncHandler(async (req, res) => {
  const agence = await Agence.findById(req.params.id);
  
  if (agence) {
    res.status(200).json({
      success: true,
      data: agence
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
});

// @desc    Create new agency
// @route   POST /api/agences
// @access  Private/Admin
const createAgence = asyncHandler(async (req, res) => {
  const { 
    nom, 
    email, 
    telephone, 
    adresse, 
    typeActivite, 
    siret, 
    modulesActifs = [],
    password = 'password123' // Mot de passe par défaut
  } = req.body;

  if (!nom || !email || !telephone || !adresse) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }

  // Vérifier si l'email est déjà utilisé
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(400).json({
      success: false,
      message: 'Cet email est déjà utilisé'
    });
  }

  // Créer l'agence
  const agence = await Agence.create({
    nom,
    email,
    telephone,
    adresse,
    statut: 'approuve', // Approuvée par défaut car créée par un admin
    modulesActifs,
    typeActivite,
    siret
  });

  // Créer l'utilisateur associé
  const user = await User.create({
    email,
    password,
    nom,
    prenom: '',
    role: 'agence',
    statut: 'actif',
    agenceId: agence._id
  });

  res.status(201).json({
    success: true,
    message: 'Agence créée avec succès',
    data: agence
  });
});

// @desc    Approve agency
// @route   PUT /api/agences/:id/approve
// @access  Private/Admin
const approveAgence = asyncHandler(async (req, res) => {
  const agence = await Agence.findById(req.params.id);
  
  if (agence) {
    // Déplacer les modules demandés vers les modules actifs
    if (agence.modulesDemandes && agence.modulesDemandes.length > 0) {
      // Fusionner les modules demandés avec les modules actifs existants (s'il y en a)
      const newModulesActifs = [...new Set([...agence.modulesActifs, ...agence.modulesDemandes])];
      agence.modulesActifs = newModulesActifs;
      agence.modulesDemandes = []; // Vider les modules demandés
    }
    
    agence.statut = 'approuve';
    const updatedAgence = await agence.save();
    
    // Update user status
    const user = await User.findOne({ agenceId: agence._id });
    if (user) {
      user.statut = 'actif';
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Agence approuvée avec succès',
      data: updatedAgence
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
});

// @desc    Reject agency
// @route   PUT /api/agences/:id/reject
// @access  Private/Admin
const rejectAgence = asyncHandler(async (req, res) => {
  const agence = await Agence.findById(req.params.id);
  
  if (agence) {
    agence.statut = 'rejete';
    const updatedAgence = await agence.save();
    
    // Update user status
    const user = await User.findOne({ agenceId: agence._id });
    if (user) {
      user.statut = 'rejete';
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Agence rejetée avec succès',
      data: updatedAgence
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
});

// @desc    Suspend agency
// @route   PUT /api/agences/:id/suspend
// @access  Private/Admin
const suspendAgence = asyncHandler(async (req, res) => {
  const agence = await Agence.findById(req.params.id);
  
  if (agence) {
    agence.statut = 'suspendu';
    const updatedAgence = await agence.save();
    
    // Update user status
    const user = await User.findOne({ agenceId: agence._id });
    if (user) {
      user.statut = 'suspendu';
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Agence suspendue avec succès',
      data: updatedAgence
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
});

// @desc    Update agency modules
// @route   PUT /api/agences/:id/modules
// @access  Private/Admin
const updateAgenceModules = asyncHandler(async (req, res) => {
  const { modules } = req.body;
  
  if (!modules || !Array.isArray(modules)) {
    return res.status(400).json({
      success: false,
      message: 'Liste de modules manquante ou invalide'
    });
  }
  
  const agence = await Agence.findById(req.params.id);
  
  if (agence) {
    agence.modulesActifs = modules;
    const updatedAgence = await agence.save();
    
    res.status(200).json({
      success: true,
      message: 'Modules mis à jour avec succès',
      data: updatedAgence
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
});

module.exports = {
  getAgences,
  getAgenceById,
  createAgence,
  approveAgence,
  rejectAgence,
  suspendAgence,
  updateAgenceModules
};