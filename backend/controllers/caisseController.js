const asyncHandler = require('express-async-handler');
const Operation = require('../models/operationModel');

// @desc    Get all operations
// @route   GET /api/caisse/operations
// @access  Private
const getOperations = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const operations = await Operation.find({}).sort({ date: -1 });
  
  res.status(200).json({
    success: true,
    data: operations
  });
});

// @desc    Get caisse solde
// @route   GET /api/caisse/solde
// @access  Private
const getSolde = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const operations = await Operation.find({});
  
  const entrees = operations
    .filter(op => op.type === 'entree')
    .reduce((sum, op) => sum + op.montant, 0);
  
  const sorties = operations
    .filter(op => op.type === 'sortie')
    .reduce((sum, op) => sum + op.montant, 0);
  
  const solde = entrees - sorties;
  
  res.status(200).json({
    success: true,
    data: {
      solde,
      entrees,
      sorties
    }
  });
});

// @desc    Create new operation
// @route   POST /api/caisse/operations
// @access  Private
const createOperation = asyncHandler(async (req, res) => {
  const { type, montant, description, categorie, reference, date } = req.body;
  
  if (!type || !montant || !description || !categorie) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  if (type !== 'entree' && type !== 'sortie') {
    return res.status(400).json({
      success: false,
      message: 'Type d\'opération invalide'
    });
  }
  
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const operation = await Operation.create({
    type,
    montant: parseFloat(montant),
    description,
    categorie,
    reference: reference || '',
    date: date || Date.now(),
    agenceId
  });
  
  res.status(201).json({
    success: true,
    message: 'Opération créée avec succès',
    data: operation
  });
});

// @desc    Update operation
// @route   PUT /api/caisse/operations/:id
// @access  Private
const updateOperation = asyncHandler(async (req, res) => {
  const { type, montant, description, categorie, reference, date } = req.body;
  
  if (!type || !montant || !description || !categorie) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  if (type !== 'entree' && type !== 'sortie') {
    return res.status(400).json({
      success: false,
      message: 'Type d\'opération invalide'
    });
  }
  
  const operation = await Operation.findById(req.params.id);
  
  if (operation) {
    operation.type = type;
    operation.montant = parseFloat(montant);
    operation.description = description;
    operation.categorie = categorie;
    operation.reference = reference || '';
    operation.date = date || operation.date;
    
    const updatedOperation = await operation.save();
    
    res.status(200).json({
      success: true,
      message: 'Opération mise à jour avec succès',
      data: updatedOperation
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Opération non trouvée'
    });
  }
});

// @desc    Delete operation
// @route   DELETE /api/caisse/operations/:id
// @access  Private
const deleteOperation = asyncHandler(async (req, res) => {
  const operation = await Operation.findById(req.params.id);
  
  if (operation) {
    await Operation.deleteOne({ _id: operation._id });
    
    res.status(200).json({
      success: true,
      message: 'Opération supprimée avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Opération non trouvée'
    });
  }
});

module.exports = {
  getOperations,
  getSolde,
  createOperation,
  updateOperation,
  deleteOperation
};