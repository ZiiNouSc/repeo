const asyncHandler = require('express-async-handler');
const Package = require('../models/packageModel');

// @desc    Get all packages
// @route   GET /api/packages
// @access  Private
const getPackages = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const packages = await Package.find({});
  
  res.status(200).json({
    success: true,
    data: packages
  });
});

// @desc    Get public packages (visible only)
// @route   GET /api/packages/public
// @access  Public
const getPublicPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find({ visible: true });
  
  res.status(200).json({
    success: true,
    data: packages
  });
});

// @desc    Get package by ID
// @route   GET /api/packages/:id
// @access  Private
const getPackageById = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  
  if (pkg) {
    res.status(200).json({
      success: true,
      data: pkg
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Package non trouvé'
    });
  }
});

// @desc    Create new package
// @route   POST /api/packages
// @access  Private
const createPackage = asyncHandler(async (req, res) => {
  const { nom, description, prix, duree, inclusions, visible = true } = req.body;
  
  if (!nom || !description || !prix || !duree || !inclusions) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const pkg = await Package.create({
    nom,
    description,
    prix: parseFloat(prix),
    duree,
    inclusions: Array.isArray(inclusions) ? inclusions : [],
    visible,
    agenceId
  });
  
  res.status(201).json({
    success: true,
    message: 'Package créé avec succès',
    data: pkg
  });
});

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private
const updatePackage = asyncHandler(async (req, res) => {
  const { nom, description, prix, duree, inclusions, visible } = req.body;
  
  if (!nom || !description || !prix || !duree || !inclusions) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const pkg = await Package.findById(req.params.id);
  
  if (pkg) {
    pkg.nom = nom;
    pkg.description = description;
    pkg.prix = parseFloat(prix);
    pkg.duree = duree;
    pkg.inclusions = Array.isArray(inclusions) ? inclusions : [];
    pkg.visible = visible !== undefined ? visible : pkg.visible;
    
    const updatedPackage = await pkg.save();
    
    res.status(200).json({
      success: true,
      message: 'Package mis à jour avec succès',
      data: updatedPackage
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Package non trouvé'
    });
  }
});

// @desc    Toggle package visibility
// @route   PUT /api/packages/:id/toggle-visibility
// @access  Private
const togglePackageVisibility = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  
  if (pkg) {
    pkg.visible = !pkg.visible;
    const updatedPackage = await pkg.save();
    
    res.status(200).json({
      success: true,
      message: `Package ${pkg.visible ? 'visible' : 'masqué'}`,
      data: updatedPackage
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Package non trouvé'
    });
  }
});

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private
const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  
  if (pkg) {
    await Package.deleteOne({ _id: pkg._id });
    
    res.status(200).json({
      success: true,
      message: 'Package supprimé avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Package non trouvé'
    });
  }
});

module.exports = {
  getPackages,
  getPublicPackages,
  getPackageById,
  createPackage,
  updatePackage,
  togglePackageVisibility,
  deletePackage
};