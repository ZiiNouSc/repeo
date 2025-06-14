const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all bons de commande
router.get('/', (req, res) => {
  try {
    const bonsCommande = readData('bonsCommande');
    const clients = readData('clients');
    
    // Attach client data to each bon de commande
    const bonsCommandeWithClients = bonsCommande.map(bon => {
      const client = clients.find(c => c.id === bon.clientId) || {};
      return { ...bon, client };
    });
    
    res.status(200).json({
      success: true,
      data: bonsCommandeWithClients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des bons de commande',
      error: error.message
    });
  }
});

// Get bon de commande by ID
router.get('/:id', (req, res) => {
  try {
    const bonsCommande = readData('bonsCommande');
    const clients = readData('clients');
    
    const bon = bonsCommande.find(b => b.id === req.params.id);
    
    if (!bon) {
      return res.status(404).json({
        success: false,
        message: 'Bon de commande non trouvé'
      });
    }
    
    const client = clients.find(c => c.id === bon.clientId) || {};
    const bonWithClient = { ...bon, client };
    
    res.status(200).json({
      success: true,
      data: bonWithClient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du bon de commande',
      error: error.message
    });
  }
});

// Create new bon de commande
router.post('/', (req, res) => {
  try {
    const { clientId, articles, statut = 'brouillon' } = req.body;
    
    if (!clientId || !articles || !articles.length) {
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
    
    const bonsCommande = readData('bonsCommande');
    
    // Calculate totals
    const montantHT = articles.reduce((sum, article) => sum + article.montant, 0);
    const montantTTC = montantHT * 1.2; // Assuming 20% VAT
    
    // Generate bon de commande number
    const bonCount = bonsCommande.length + 1;
    const numero = `BC-${new Date().getFullYear()}-${String(bonCount).padStart(3, '0')}`;
    
    const newBon = {
      id: generateId(),
      numero,
      clientId,
      dateCreation: formatDate(new Date()),
      statut,
      montantHT,
      montantTTC,
      articles: articles.map(article => ({
        id: generateId(),
        ...article
      }))
    };
    
    bonsCommande.push(newBon);
    
    if (writeData('bonsCommande', bonsCommande)) {
      // Add client data to response
      const bonWithClient = { ...newBon, client };
      
      res.status(201).json({
        success: true,
        message: 'Bon de commande créé avec succès',
        data: bonWithClient
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du bon de commande',
      error: error.message
    });
  }
});

// Update bon de commande
router.put('/:id', (req, res) => {
  try {
    const { clientId, articles, statut } = req.body;
    
    if (!clientId || !articles || !articles.length) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const bonsCommande = readData('bonsCommande');
    const bonIndex = bonsCommande.findIndex(b => b.id === req.params.id);
    
    if (bonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bon de commande non trouvé'
      });
    }
    
    // Calculate totals
    const montantHT = articles.reduce((sum, article) => sum + article.montant, 0);
    const montantTTC = montantHT * 1.2; // Assuming 20% VAT
    
    const updatedBon = {
      ...bonsCommande[bonIndex],
      clientId,
      statut: statut || bonsCommande[bonIndex].statut,
      montantHT,
      montantTTC,
      articles: articles.map(article => ({
        id: article.id || generateId(),
        ...article
      }))
    };
    
    bonsCommande[bonIndex] = updatedBon;
    
    if (writeData('bonsCommande', bonsCommande)) {
      // Get client data
      const clients = readData('clients');
      const client = clients.find(c => c.id === clientId) || {};
      
      res.status(200).json({
        success: true,
        message: 'Bon de commande mis à jour avec succès',
        data: { ...updatedBon, client }
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du bon de commande',
      error: error.message
    });
  }
});

// Convert bon de commande to facture
router.post('/:id/convert', (req, res) => {
  try {
    const bonsCommande = readData('bonsCommande');
    const bon = bonsCommande.find(b => b.id === req.params.id);
    
    if (!bon) {
      return res.status(404).json({
        success: false,
        message: 'Bon de commande non trouvé'
      });
    }
    
    if (bon.statut !== 'accepte') {
      return res.status(400).json({
        success: false,
        message: 'Le bon de commande doit être accepté pour être converti en facture'
      });
    }
    
    // Update bon status
    const bonIndex = bonsCommande.findIndex(b => b.id === req.params.id);
    bonsCommande[bonIndex].statut = 'facture';
    writeData('bonsCommande', bonsCommande);
    
    // Create new facture
    const factures = readData('factures');
    
    // Generate facture number
    const factureCount = factures.length + 1;
    const numero = `FAC-${new Date().getFullYear()}-${String(factureCount).padStart(3, '0')}`;
    
    // Set due date to 30 days from now
    const dateEmission = new Date();
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEcheance.getDate() + 30);
    
    const newFacture = {
      id: generateId(),
      numero,
      clientId: bon.clientId,
      dateEmission: formatDate(dateEmission),
      dateEcheance: formatDate(dateEcheance),
      statut: 'envoyee',
      montantHT: bon.montantHT,
      montantTTC: bon.montantTTC,
      articles: bon.articles
    };
    
    factures.push(newFacture);
    
    if (writeData('factures', factures)) {
      // Get client data
      const clients = readData('clients');
      const client = clients.find(c => c.id === bon.clientId) || {};
      
      res.status(201).json({
        success: true,
        message: 'Bon de commande converti en facture avec succès',
        data: { ...newFacture, client }
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la conversion du bon de commande',
      error: error.message
    });
  }
});

// Delete bon de commande
router.delete('/:id', (req, res) => {
  try {
    const bonsCommande = readData('bonsCommande');
    const bonIndex = bonsCommande.findIndex(b => b.id === req.params.id);
    
    if (bonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bon de commande non trouvé'
      });
    }
    
    bonsCommande.splice(bonIndex, 1);
    
    if (writeData('bonsCommande', bonsCommande)) {
      res.status(200).json({
        success: true,
        message: 'Bon de commande supprimé avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du bon de commande',
      error: error.message
    });
  }
});

module.exports = router;