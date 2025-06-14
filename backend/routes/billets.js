const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all billets
router.get('/', (req, res) => {
  try {
    const billets = readData('billets');
    res.status(200).json({
      success: true,
      data: billets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des billets',
      error: error.message
    });
  }
});

// Get billet by ID
router.get('/:id', (req, res) => {
  try {
    const billets = readData('billets');
    const billet = billets.find(b => b.id === req.params.id);
    
    if (!billet) {
      return res.status(404).json({
        success: false,
        message: 'Billet non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: billet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du billet',
      error: error.message
    });
  }
});

// Create new billet
router.post('/', (req, res) => {
  try {
    const { 
      numeroVol, 
      compagnie, 
      dateDepart, 
      dateArrivee, 
      origine, 
      destination, 
      passager, 
      prix, 
      statut = 'en_attente' 
    } = req.body;
    
    if (!numeroVol || !compagnie || !dateDepart || !dateArrivee || !origine || !destination || !passager || !prix) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const billets = readData('billets');
    
    const newBillet = {
      id: generateId(),
      numeroVol,
      compagnie,
      dateDepart: formatDate(dateDepart),
      dateArrivee: formatDate(dateArrivee),
      origine,
      destination,
      passager,
      prix: parseFloat(prix),
      statut
    };
    
    billets.push(newBillet);
    
    if (writeData('billets', billets)) {
      res.status(201).json({
        success: true,
        message: 'Billet créé avec succès',
        data: newBillet
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du billet',
      error: error.message
    });
  }
});

// Update billet
router.put('/:id', (req, res) => {
  try {
    const { 
      numeroVol, 
      compagnie, 
      dateDepart, 
      dateArrivee, 
      origine, 
      destination, 
      passager, 
      prix, 
      statut 
    } = req.body;
    
    if (!numeroVol || !compagnie || !dateDepart || !dateArrivee || !origine || !destination || !passager || !prix) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const billets = readData('billets');
    const billetIndex = billets.findIndex(b => b.id === req.params.id);
    
    if (billetIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Billet non trouvé'
      });
    }
    
    const updatedBillet = {
      ...billets[billetIndex],
      numeroVol,
      compagnie,
      dateDepart: formatDate(dateDepart),
      dateArrivee: formatDate(dateArrivee),
      origine,
      destination,
      passager,
      prix: parseFloat(prix),
      statut: statut || billets[billetIndex].statut
    };
    
    billets[billetIndex] = updatedBillet;
    
    if (writeData('billets', billets)) {
      res.status(200).json({
        success: true,
        message: 'Billet mis à jour avec succès',
        data: updatedBillet
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du billet',
      error: error.message
    });
  }
});

// Delete billet
router.delete('/:id', (req, res) => {
  try {
    const billets = readData('billets');
    const billetIndex = billets.findIndex(b => b.id === req.params.id);
    
    if (billetIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Billet non trouvé'
      });
    }
    
    billets.splice(billetIndex, 1);
    
    if (writeData('billets', billets)) {
      res.status(200).json({
        success: true,
        message: 'Billet supprimé avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du billet',
      error: error.message
    });
  }
});

module.exports = router;