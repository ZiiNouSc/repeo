const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/dataHelper');

// Get all creances (unpaid invoices)
router.get('/', (req, res) => {
  try {
    const factures = readData('factures');
    const clients = readData('clients');
    
    // Filter unpaid and overdue invoices
    const creances = factures.filter(f => 
      f.statut === 'en_retard' || 
      (f.statut === 'envoyee' && new Date(f.dateEcheance) < new Date())
    );
    
    // Attach client data to each creance
    const creancesWithClients = creances.map(creance => {
      const client = clients.find(c => c.id === creance.clientId) || {};
      return { ...creance, client };
    });
    
    res.status(200).json({
      success: true,
      data: creancesWithClients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des créances',
      error: error.message
    });
  }
});

// Send reminder for a creance
router.post('/:id/reminder', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message de relance manquant'
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
    
    // In a real app, this would send an email or SMS
    // For now, we'll just update the facture to indicate a reminder was sent
    factures[factureIndex].lastReminder = new Date().toISOString();
    
    if (writeData('factures', factures)) {
      res.status(200).json({
        success: true,
        message: 'Relance envoyée avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la relance',
      error: error.message
    });
  }
});

// Get creance statistics
router.get('/stats', (req, res) => {
  try {
    const factures = readData('factures');
    
    // Filter unpaid and overdue invoices
    const creances = factures.filter(f => 
      f.statut === 'en_retard' || 
      (f.statut === 'envoyee' && new Date(f.dateEcheance) < new Date())
    );
    
    const totalCreances = creances.reduce((sum, c) => sum + c.montantTTC, 0);
    const totalFactures = creances.length;
    
    // Calculate average days late
    let totalDaysLate = 0;
    creances.forEach(creance => {
      const echeance = new Date(creance.dateEcheance);
      const today = new Date();
      const diffTime = today - echeance;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDaysLate += diffDays > 0 ? diffDays : 0;
    });
    
    const avgDaysLate = totalFactures > 0 ? Math.round(totalDaysLate / totalFactures) : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalCreances,
        totalFactures,
        avgDaysLate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

module.exports = router;