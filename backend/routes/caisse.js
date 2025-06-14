const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all operations
router.get('/operations', (req, res) => {
  try {
    const operations = readData('operations');
    res.status(200).json({
      success: true,
      data: operations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des opérations',
      error: error.message
    });
  }
});

// Get caisse solde
router.get('/solde', (req, res) => {
  try {
    const operations = readData('operations');
    
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul du solde',
      error: error.message
    });
  }
});

// Create new operation
router.post('/operations', (req, res) => {
  try {
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
    
    const operations = readData('operations');
    
    const newOperation = {
      id: generateId(),
      type,
      montant: parseFloat(montant),
      description,
      categorie,
      reference: reference || '',
      date: formatDate(date || new Date())
    };
    
    operations.push(newOperation);
    
    if (writeData('operations', operations)) {
      res.status(201).json({
        success: true,
        message: 'Opération créée avec succès',
        data: newOperation
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'opération',
      error: error.message
    });
  }
});

// Update operation
router.put('/operations/:id', (req, res) => {
  try {
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
    
    const operations = readData('operations');
    const operationIndex = operations.findIndex(op => op.id === req.params.id);
    
    if (operationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Opération non trouvée'
      });
    }
    
    const updatedOperation = {
      ...operations[operationIndex],
      type,
      montant: parseFloat(montant),
      description,
      categorie,
      reference: reference || '',
      date: formatDate(date || operations[operationIndex].date)
    };
    
    operations[operationIndex] = updatedOperation;
    
    if (writeData('operations', operations)) {
      res.status(200).json({
        success: true,
        message: 'Opération mise à jour avec succès',
        data: updatedOperation
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'opération',
      error: error.message
    });
  }
});

// Delete operation
router.delete('/operations/:id', (req, res) => {
  try {
    const operations = readData('operations');
    const operationIndex = operations.findIndex(op => op.id === req.params.id);
    
    if (operationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Opération non trouvée'
      });
    }
    
    operations.splice(operationIndex, 1);
    
    if (writeData('operations', operations)) {
      res.status(200).json({
        success: true,
        message: 'Opération supprimée avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'opération',
      error: error.message
    });
  }
});

module.exports = router;