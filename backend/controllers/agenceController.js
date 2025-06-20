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

// @desc    Approve agency
// @route   PUT /api/agences/:id/approve
// @access  Private/Admin
const approveAgence = asyncHandler(async (req, res) => {
  const agence = await Agence.findById(req.params.id);
  
  if (agence) {
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
  approveAgence,
  rejectAgence,
  suspendAgence,
  updateAgenceModules
};