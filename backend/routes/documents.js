const express = require('express');
const router = express.Router();
const { 
  getDocuments, 
  getDocumentById, 
  createDocument, 
  updateDocument, 
  deleteDocument 
} = require('../controllers/documentController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// Get all documents
router.get('/', protect, hasPermission('documents', 'lire'), getDocuments);

// Get document by ID
router.get('/:id', protect, hasPermission('documents', 'lire'), getDocumentById);

// Create new document
router.post('/', protect, hasPermission('documents', 'creer'), createDocument);

// Update document
router.put('/:id', protect, hasPermission('documents', 'modifier'), updateDocument);

// Delete document
router.delete('/:id', protect, hasPermission('documents', 'supprimer'), deleteDocument);

module.exports = router;