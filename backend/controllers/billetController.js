const asyncHandler = require('express-async-handler');
const Billet = require('../models/billetModel');

// @desc    Get all billets
// @route   GET /api/billets
// @access  Private
const getBillets = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const billets = await Billet.find({});
  
  res.status(200).json({
    success: true,
    data: billets
  });
});

// @desc    Get billet by ID
// @route   GET /api/billets/:id
// @access  Private
const getBilletById = asyncHandler(async (req, res) => {
  const billet = await Billet.findById(req.params.id);
  
  if (billet) {
    res.status(200).json({
      success: true,
      data: billet
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Billet non trouvé'
    });
  }
});

// @desc    Create new billet
// @route   POST /api/billets
// @access  Private
const createBillet = asyncHandler(async (req, res) => {
  const { 
    numeroVol, 
    compagnie, 
    dateDepart, 
    dateArrivee, 
    origine, 
    destination, 
    passager, 
    prix, 
    statut = 'en_attente',
    clientId
  } = req.body;
  
  if (!numeroVol || !compagnie || !dateDepart || !dateArrivee || !origine || !destination || !passager || !prix) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const billet = await Billet.create({
    numeroVol,
    compagnie,
    dateDepart,
    dateArrivee,
    origine,
    destination,
    passager,
    prix: parseFloat(prix),
    statut,
    clientId,
    agenceId
  });
  
  res.status(201).json({
    success: true,
    message: 'Billet créé avec succès',
    data: billet
  });
});

// @desc    Update billet
// @route   PUT /api/billets/:id
// @access  Private
const updateBillet = asyncHandler(async (req, res) => {
  const { 
    numeroVol, 
    compagnie, 
    dateDepart, 
    dateArrivee, 
    origine, 
    destination, 
    passager, 
    prix, 
    statut,
    clientId
  } = req.body;
  
  if (!numeroVol || !compagnie || !dateDepart || !dateArrivee || !origine || !destination || !passager || !prix) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const billet = await Billet.findById(req.params.id);
  
  if (billet) {
    billet.numeroVol = numeroVol;
    billet.compagnie = compagnie;
    billet.dateDepart = dateDepart;
    billet.dateArrivee = dateArrivee;
    billet.origine = origine;
    billet.destination = destination;
    billet.passager = passager;
    billet.prix = parseFloat(prix);
    billet.statut = statut || billet.statut;
    billet.clientId = clientId || billet.clientId;
    
    const updatedBillet = await billet.save();
    
    res.status(200).json({
      success: true,
      message: 'Billet mis à jour avec succès',
      data: updatedBillet
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Billet non trouvé'
    });
  }
});

// @desc    Delete billet
// @route   DELETE /api/billets/:id
// @access  Private
const deleteBillet = asyncHandler(async (req, res) => {
  const billet = await Billet.findById(req.params.id);
  
  if (billet) {
    await Billet.deleteOne({ _id: billet._id });
    
    res.status(200).json({
      success: true,
      message: 'Billet supprimé avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Billet non trouvé'
    });
  }
});

// @desc    Import billets from Gmail
// @route   POST /api/billets/import-gmail
// @access  Private
const importBilletsFromGmail = asyncHandler(async (req, res) => {
  // This would be implemented with Gmail API in a real app
  // For now, just return a success message
  
  res.status(200).json({
    success: true,
    message: 'Import depuis Gmail simulé avec succès',
    data: []
  });
});

module.exports = {
  getBillets,
  getBilletById,
  createBillet,
  updateBillet,
  deleteBillet,
  importBilletsFromGmail
};