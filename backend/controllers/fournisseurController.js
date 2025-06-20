const asyncHandler = require('express-async-handler');
const Fournisseur = require('../models/fournisseurModel');

// @desc    Get all fournisseurs
// @route   GET /api/fournisseurs
// @access  Private
const getFournisseurs = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const fournisseurs = await Fournisseur.find({});
  
  res.status(200).json({
    success: true,
    data: fournisseurs
  });
});

// @desc    Get fournisseur by ID
// @route   GET /api/fournisseurs/:id
// @access  Private
const getFournisseurById = asyncHandler(async (req, res) => {
  const fournisseur = await Fournisseur.findById(req.params.id);
  
  if (fournisseur) {
    res.status(200).json({
      success: true,
      data: fournisseur
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Fournisseur non trouvé'
    });
  }
});

// @desc    Create new fournisseur
// @route   POST /api/fournisseurs
// @access  Private
const createFournisseur = asyncHandler(async (req, res) => {
  const { nom, entreprise, email, telephone, adresse } = req.body;
  
  if (!nom || !entreprise || !email || !telephone || !adresse) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const fournisseur = await Fournisseur.create({
    nom,
    entreprise,
    email,
    telephone,
    adresse,
    solde: 0,
    agenceId
  });
  
  res.status(201).json({
    success: true,
    message: 'Fournisseur créé avec succès',
    data: fournisseur
  });
});

// @desc    Update fournisseur
// @route   PUT /api/fournisseurs/:id
// @access  Private
const updateFournisseur = asyncHandler(async (req, res) => {
  const { nom, entreprise, email, telephone, adresse } = req.body;
  
  if (!nom || !entreprise || !email || !telephone || !adresse) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const fournisseur = await Fournisseur.findById(req.params.id);
  
  if (fournisseur) {
    fournisseur.nom = nom;
    fournisseur.entreprise = entreprise;
    fournisseur.email = email;
    fournisseur.telephone = telephone;
    fournisseur.adresse = adresse;
    
    const updatedFournisseur = await fournisseur.save();
    
    res.status(200).json({
      success: true,
      message: 'Fournisseur mis à jour avec succès',
      data: updatedFournisseur
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Fournisseur non trouvé'
    });
  }
});

// @desc    Delete fournisseur
// @route   DELETE /api/fournisseurs/:id
// @access  Private
const deleteFournisseur = asyncHandler(async (req, res) => {
  const fournisseur = await Fournisseur.findById(req.params.id);
  
  if (fournisseur) {
    await Fournisseur.deleteOne({ _id: fournisseur._id });
    
    res.status(200).json({
      success: true,
      message: 'Fournisseur supprimé avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Fournisseur non trouvé'
    });
  }
});

module.exports = {
  getFournisseurs,
  getFournisseurById,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur
};