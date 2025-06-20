const asyncHandler = require('express-async-handler');
const Document = require('../models/documentModel');

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
const getDocuments = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const documents = await Document.find({});
  
  res.status(200).json({
    success: true,
    data: documents
  });
});

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  
  if (document) {
    res.status(200).json({
      success: true,
      data: document
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Document non trouvé'
    });
  }
});

// @desc    Create new document
// @route   POST /api/documents
// @access  Private
const createDocument = asyncHandler(async (req, res) => {
  const { 
    nom, 
    type, 
    taille, 
    clientId, 
    clientNom, 
    categorie, 
    url, 
    description 
  } = req.body;
  
  if (!nom || !type || !taille || !categorie || !url) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const document = await Document.create({
    nom,
    type,
    taille: parseInt(taille),
    clientId,
    clientNom,
    categorie,
    url,
    description,
    agenceId
  });
  
  res.status(201).json({
    success: true,
    message: 'Document créé avec succès',
    data: document
  });
});

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = asyncHandler(async (req, res) => {
  const { 
    nom, 
    categorie, 
    clientId, 
    clientNom, 
    description 
  } = req.body;
  
  if (!nom || !categorie) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const document = await Document.findById(req.params.id);
  
  if (document) {
    document.nom = nom;
    document.categorie = categorie;
    document.clientId = clientId;
    document.clientNom = clientNom;
    document.description = description;
    document.dateModification = Date.now();
    
    const updatedDocument = await document.save();
    
    res.status(200).json({
      success: true,
      message: 'Document mis à jour avec succès',
      data: updatedDocument
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Document non trouvé'
    });
  }
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  
  if (document) {
    await Document.deleteOne({ _id: document._id });
    
    res.status(200).json({
      success: true,
      message: 'Document supprimé avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Document non trouvé'
    });
  }
});

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
};