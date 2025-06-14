const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all packages
router.get('/', (req, res) => {
  try {
    const packages = readData('packages');
    res.status(200).json({
      success: true,
      data: packages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des packages',
      error: error.message
    });
  }
});

// Get public packages (visible only)
router.get('/public', (req, res) => {
  try {
    const packages = readData('packages');
    const visiblePackages = packages.filter(pkg => pkg.visible);
    
    res.status(200).json({
      success: true,
      data: visiblePackages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des packages publics',
      error: error.message
    });
  }
});

// Get package by ID
router.get('/:id', (req, res) => {
  try {
    const packages = readData('packages');
    const pkg = packages.find(p => p.id === req.params.id);
    
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: pkg
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du package',
      error: error.message
    });
  }
});

// Create new package
router.post('/', (req, res) => {
  try {
    const { nom, description, prix, duree, inclusions, visible = true } = req.body;
    
    if (!nom || !description || !prix || !duree || !inclusions) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const packages = readData('packages');
    
    const newPackage = {
      id: generateId(),
      nom,
      description,
      prix: parseFloat(prix),
      duree,
      inclusions: Array.isArray(inclusions) ? inclusions : [],
      visible,
      dateCreation: formatDate(new Date())
    };
    
    packages.push(newPackage);
    
    if (writeData('packages', packages)) {
      res.status(201).json({
        success: true,
        message: 'Package créé avec succès',
        data: newPackage
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du package',
      error: error.message
    });
  }
});

// Update package
router.put('/:id', (req, res) => {
  try {
    const { nom, description, prix, duree, inclusions, visible } = req.body;
    
    if (!nom || !description || !prix || !duree || !inclusions) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const packages = readData('packages');
    const packageIndex = packages.findIndex(p => p.id === req.params.id);
    
    if (packageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Package non trouvé'
      });
    }
    
    const updatedPackage = {
      ...packages[packageIndex],
      nom,
      description,
      prix: parseFloat(prix),
      duree,
      inclusions: Array.isArray(inclusions) ? inclusions : [],
      visible: visible !== undefined ? visible : packages[packageIndex].visible
    };
    
    packages[packageIndex] = updatedPackage;
    
    if (writeData('packages', packages)) {
      res.status(200).json({
        success: true,
        message: 'Package mis à jour avec succès',
        data: updatedPackage
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du package',
      error: error.message
    });
  }
});

// Toggle package visibility
router.put('/:id/toggle-visibility', (req, res) => {
  try {
    const packages = readData('packages');
    const packageIndex = packages.findIndex(p => p.id === req.params.id);
    
    if (packageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Package non trouvé'
      });
    }
    
    packages[packageIndex].visible = !packages[packageIndex].visible;
    
    if (writeData('packages', packages)) {
      res.status(200).json({
        success: true,
        message: `Package ${packages[packageIndex].visible ? 'visible' : 'masqué'}`,
        data: packages[packageIndex]
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la visibilité',
      error: error.message
    });
  }
});

// Delete package
router.delete('/:id', (req, res) => {
  try {
    const packages = readData('packages');
    const packageIndex = packages.findIndex(p => p.id === req.params.id);
    
    if (packageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Package non trouvé'
      });
    }
    
    packages.splice(packageIndex, 1);
    
    if (writeData('packages', packages)) {
      res.status(200).json({
        success: true,
        message: 'Package supprimé avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du package',
      error: error.message
    });
  }
});

module.exports = router;