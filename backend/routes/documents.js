const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all documents
router.get('/', (req, res) => {
  try {
    const documents = readData('documents');
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
});

// Get document by ID
router.get('/:id', (req, res) => {
  try {
    const documents = readData('documents');
    const document = documents.find(d => d.id === req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du document',
      error: error.message
    });
  }
});

// Create new document
router.post('/', (req, res) => {
  try {
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
    
    const documents = readData('documents');
    const now = new Date();
    
    const newDocument = {
      id: generateId(),
      nom,
      type,
      taille: parseInt(taille),
      clientId,
      clientNom,
      categorie,
      dateCreation: formatDate(now),
      dateModification: formatDate(now),
      url,
      description
    };
    
    documents.push(newDocument);
    
    if (writeData('documents', documents)) {
      res.status(201).json({
        success: true,
        message: 'Document créé avec succès',
        data: newDocument
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du document',
      error: error.message
    });
  }
});

// Update document
router.put('/:id', (req, res) => {
  try {
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
    
    const documents = readData('documents');
    const documentIndex = documents.findIndex(d => d.id === req.params.id);
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    const updatedDocument = {
      ...documents[documentIndex],
      nom,
      categorie,
      clientId,
      clientNom,
      description,
      dateModification: formatDate(new Date())
    };
    
    documents[documentIndex] = updatedDocument;
    
    if (writeData('documents', documents)) {
      res.status(200).json({
        success: true,
        message: 'Document mis à jour avec succès',
        data: updatedDocument
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du document',
      error: error.message
    });
  }
});

// Delete document
router.delete('/:id', (req, res) => {
  try {
    const documents = readData('documents');
    const documentIndex = documents.findIndex(d => d.id === req.params.id);
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    documents.splice(documentIndex, 1);
    
    if (writeData('documents', documents)) {
      res.status(200).json({
        success: true,
        message: 'Document supprimé avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du document',
      error: error.message
    });
  }
});

module.exports = router;