const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all fournisseurs
router.get('/', (req, res) => {
  try {
    const fournisseurs = readData('fournisseurs');
    res.status(200).json({
      success: true,
      data: fournisseurs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fournisseurs',
      error: error.message
    });
  }
});

// Get fournisseur by ID
router.get('/:id', (req, res) => {
  try {
    const fournisseurs = readData('fournisseurs');
    const fournisseur = fournisseurs.find(f => f.id === req.params.id);
    
    if (!fournisseur) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: fournisseur
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du fournisseur',
      error: error.message
    });
  }
});

// Create new fournisseur
router.post('/', (req, res) => {
  try {
    const { nom, entreprise, email, telephone, adresse } = req.body;
    
    if (!nom || !entreprise || !email || !telephone || !adresse) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const fournisseurs = readData('fournisseurs');
    
    const newFournisseur = {
      id: generateId(),
      nom,
      entreprise,
      email,
      telephone,
      adresse,
      solde: 0,
      dateCreation: formatDate(new Date())
    };
    
    fournisseurs.push(newFournisseur);
    
    if (writeData('fournisseurs', fournisseurs)) {
      res.status(201).json({
        success: true,
        message: 'Fournisseur créé avec succès',
        data: newFournisseur
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du fournisseur',
      error: error.message
    });
  }
});

// Update fournisseur
router.put('/:id', (req, res) => {
  try {
    const { nom, entreprise, email, telephone, adresse } = req.body;
    
    if (!nom || !entreprise || !email || !telephone || !adresse) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const fournisseurs = readData('fournisseurs');
    const fournisseurIndex = fournisseurs.findIndex(f => f.id === req.params.id);
    
    if (fournisseurIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }
    
    const updatedFournisseur = {
      ...fournisseurs[fournisseurIndex],
      nom,
      entreprise,
      email,
      telephone,
      adresse
    };
    
    fournisseurs[fournisseurIndex] = updatedFournisseur;
    
    if (writeData('fournisseurs', fournisseurs)) {
      res.status(200).json({
        success: true,
        message: 'Fournisseur mis à jour avec succès',
        data: updatedFournisseur
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du fournisseur',
      error: error.message
    });
  }
});

// Delete fournisseur
router.delete('/:id', (req, res) => {
  try {
    const fournisseurs = readData('fournisseurs');
    const fournisseurIndex = fournisseurs.findIndex(f => f.id === req.params.id);
    
    if (fournisseurIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }
    
    fournisseurs.splice(fournisseurIndex, 1);
    
    if (writeData('fournisseurs', fournisseurs)) {
      res.status(200).json({
        success: true,
        message: 'Fournisseur supprimé avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fournisseur',
      error: error.message
    });
  }
});

module.exports = router;