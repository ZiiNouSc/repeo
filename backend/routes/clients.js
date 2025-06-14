const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all clients
router.get('/', (req, res) => {
  try {
    const clients = readData('clients');
    res.status(200).json({
      success: true,
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clients',
      error: error.message
    });
  }
});

// Get client by ID
router.get('/:id', (req, res) => {
  try {
    const clients = readData('clients');
    const client = clients.find(c => c.id === req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du client',
      error: error.message
    });
  }
});

// Create new client
router.post('/', (req, res) => {
  try {
    const { nom, prenom, entreprise, email, telephone, adresse } = req.body;
    
    if (!nom || !email || !telephone || !adresse) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const clients = readData('clients');
    
    const newClient = {
      id: generateId(),
      nom,
      prenom: prenom || '',
      entreprise: entreprise || '',
      email,
      telephone,
      adresse,
      solde: 0,
      dateCreation: formatDate(new Date())
    };
    
    clients.push(newClient);
    
    if (writeData('clients', clients)) {
      res.status(201).json({
        success: true,
        message: 'Client créé avec succès',
        data: newClient
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du client',
      error: error.message
    });
  }
});

// Update client
router.put('/:id', (req, res) => {
  try {
    const { nom, prenom, entreprise, email, telephone, adresse } = req.body;
    
    if (!nom || !email || !telephone || !adresse) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const clients = readData('clients');
    const clientIndex = clients.findIndex(c => c.id === req.params.id);
    
    if (clientIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    const updatedClient = {
      ...clients[clientIndex],
      nom,
      prenom: prenom || '',
      entreprise: entreprise || '',
      email,
      telephone,
      adresse
    };
    
    clients[clientIndex] = updatedClient;
    
    if (writeData('clients', clients)) {
      res.status(200).json({
        success: true,
        message: 'Client mis à jour avec succès',
        data: updatedClient
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du client',
      error: error.message
    });
  }
});

// Delete client
router.delete('/:id', (req, res) => {
  try {
    const clients = readData('clients');
    const clientIndex = clients.findIndex(c => c.id === req.params.id);
    
    if (clientIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    clients.splice(clientIndex, 1);
    
    if (writeData('clients', clients)) {
      res.status(200).json({
        success: true,
        message: 'Client supprimé avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du client',
      error: error.message
    });
  }
});

module.exports = router;