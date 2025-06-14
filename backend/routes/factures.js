const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all factures
router.get('/', (req, res) => {
  try {
    const factures = readData('factures');
    const clients = readData('clients');
    
    // Attach client data to each facture
    const facturesWithClients = factures.map(facture => {
      const client = clients.find(c => c.id === facture.clientId) || {};
      return { ...facture, client };
    });
    
    res.status(200).json({
      success: true,
      data: facturesWithClients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures',
      error: error.message
    });
  }
});

// Get facture by ID
router.get('/:id', (req, res) => {
  try {
    const factures = readData('factures');
    const clients = readData('clients');
    
    const facture = factures.find(f => f.id === req.params.id);
    
    if (!facture) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }
    
    const client = clients.find(c => c.id === facture.clientId) || {};
    const factureWithClient = { ...facture, client };
    
    res.status(200).json({
      success: true,
      data: factureWithClient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la facture',
      error: error.message
    });
  }
});

// Create new facture
router.post('/', (req, res) => {
  try {
    const { clientId, dateEmission, dateEcheance, articles, statut = 'brouillon' } = req.body;
    
    if (!clientId || !dateEmission || !dateEcheance || !articles || !articles.length) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const clients = readData('clients');
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    const factures = readData('factures');
    
    // Calculate totals
    const montantHT = articles.reduce((sum, article) => sum + article.montant, 0);
    const montantTTC = montantHT * 1.2; // Assuming 20% VAT
    
    // Generate facture number
    const factureCount = factures.length + 1;
    const numero = `FAC-${new Date().getFullYear()}-${String(factureCount).padStart(3, '0')}`;
    
    const newFacture = {
      id: generateId(),
      numero,
      clientId,
      dateEmission: formatDate(dateEmission),
      dateEcheance: formatDate(dateEcheance),
      statut,
      montantHT,
      montantTTC,
      articles: articles.map(article => ({
        id: generateId(),
        ...article
      }))
    };
    
    factures.push(newFacture);
    
    if (writeData('factures', factures)) {
      // Add client data to response
      const factureWithClient = { ...newFacture, client };
      
      res.status(201).json({
        success: true,
        message: 'Facture créée avec succès',
        data: factureWithClient
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la facture',
      error: error.message
    });
  }
});

// Update facture
router.put('/:id', (req, res) => {
  try {
    const { clientId, dateEmission, dateEcheance, articles, statut } = req.body;
    
    if (!clientId || !dateEmission || !dateEcheance || !articles || !articles.length) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const factures = readData('factures');
    const factureIndex = factures.findIndex(f => f.id === req.params.id);
    
    if (factureIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }
    
    // Calculate totals
    const montantHT = articles.reduce((sum, article) => sum + article.montant, 0);
    const montantTTC = montantHT * 1.2; // Assuming 20% VAT
    
    const updatedFacture = {
      ...factures[factureIndex],
      clientId,
      dateEmission: formatDate(dateEmission),
      dateEcheance: formatDate(dateEcheance),
      statut: statut || factures[factureIndex].statut,
      montantHT,
      montantTTC,
      articles: articles.map(article => ({
        id: article.id || generateId(),
        ...article
      }))
    };
    
    factures[factureIndex] = updatedFacture;
    
    if (writeData('factures', factures)) {
      // Get client data
      const clients = readData('clients');
      const client = clients.find(c => c.id === clientId) || {};
      
      res.status(200).json({
        success: true,
        message: 'Facture mise à jour avec succès',
        data: { ...updatedFacture, client }
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la facture',
      error: error.message
    });
  }
});

// Mark facture as paid
router.put('/:id/pay', (req, res) => {
  try {
    const factures = readData('factures');
    const factureIndex = factures.findIndex(f => f.id === req.params.id);
    
    if (factureIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }
    
    factures[factureIndex].statut = 'payee';
    
    if (writeData('factures', factures)) {
      // Get client data
      const clients = readData('clients');
      const client = clients.find(c => c.id === factures[factureIndex].clientId) || {};
      
      res.status(200).json({
        success: true,
        message: 'Facture marquée comme payée',
        data: { ...factures[factureIndex], client }
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la facture',
      error: error.message
    });
  }
});

// Delete facture
router.delete('/:id', (req, res) => {
  try {
    const factures = readData('factures');
    const factureIndex = factures.findIndex(f => f.id === req.params.id);
    
    if (factureIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }
    
    factures.splice(factureIndex, 1);
    
    if (writeData('factures', factures)) {
      res.status(200).json({
        success: true,
        message: 'Facture supprimée avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la facture',
      error: error.message
    });
  }
});

module.exports = router;