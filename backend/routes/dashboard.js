const express = require('express');
const router = express.Router();
const { readData } = require('../utils/dataHelper');

// Get general dashboard stats
router.get('/stats', (req, res) => {
  try {
    const clients = readData('clients');
    const factures = readData('factures');
    const operations = readData('operations');
    const bonsCommande = readData('bonsCommande');
    
    // Calculate stats
    const totalClients = clients.length;
    
    const facturesEnAttente = factures.filter(f => 
      f.statut === 'envoyee' || f.statut === 'en_retard'
    ).length;
    
    const chiffreAffaireMois = factures
      .filter(f => {
        const factureDate = new Date(f.dateEmission);
        const now = new Date();
        return factureDate.getMonth() === now.getMonth() && 
               factureDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, f) => sum + f.montantTTC, 0);
    
    const entrees = operations
      .filter(op => op.type === 'entree')
      .reduce((sum, op) => sum + op.montant, 0);
    
    const sorties = operations
      .filter(op => op.type === 'sortie')
      .reduce((sum, op) => sum + op.montant, 0);
    
    const soldeCaisse = entrees - sorties;
    
    const facturesImpayees = factures.filter(f => f.statut === 'en_retard').length;
    
    const bonCommandeEnCours = bonsCommande.filter(b => 
      b.statut !== 'facture' && b.statut !== 'refuse'
    ).length;
    
    // Recent activities
    const recentActivities = [
      ...factures.map(f => ({
        id: `facture-${f.id}`,
        type: 'facture',
        description: `Facture #${f.numero} créée`,
        montant: f.montantTTC,
        date: f.dateEmission
      })),
      ...operations.map(op => ({
        id: `operation-${op.id}`,
        type: op.type === 'entree' ? 'paiement' : 'depense',
        description: op.description,
        montant: op.montant,
        date: op.date
      })),
      ...bonsCommande.map(bc => ({
        id: `commande-${bc.id}`,
        type: 'commande',
        description: `Bon de commande #${bc.numero} ${bc.statut}`,
        montant: bc.montantTTC,
        date: bc.dateCreation
      }))
    ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
    
    res.status(200).json({
      success: true,
      data: {
        totalClients,
        facturesEnAttente,
        chiffreAffaireMois,
        soldeCaisse,
        facturesImpayees,
        bonCommandeEnCours,
        recentActivities
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

// Get superadmin dashboard stats
router.get('/superadmin/stats', (req, res) => {
  try {
    const agences = readData('agences');
    const tickets = readData('tickets');
    
    // Calculate stats
    const totalAgences = agences.length;
    const agencesApprouvees = agences.filter(a => a.statut === 'approuve').length;
    const agencesEnAttente = agences.filter(a => a.statut === 'en_attente').length;
    const ticketsOuverts = tickets.filter(t => t.statut === 'ouvert').length;
    
    // Recent agencies
    const recentAgencies = agences
      .sort((a, b) => new Date(b.dateInscription) - new Date(a.dateInscription))
      .slice(0, 5);
    
    // Recent tickets with agency data attached
    const recentTickets = tickets
      .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
      .slice(0, 5)
      .map(ticket => {
        const agence = agences.find(a => a.id === ticket.agenceId);
        return {
          ...ticket,
          agence: agence || null
        };
      });
    
    res.status(200).json({
      success: true,
      data: {
        totalAgences,
        agencesApprouvees,
        agencesEnAttente,
        ticketsOuverts,
        recentAgencies,
        recentTickets
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

// Get agence dashboard stats
router.get('/agence/stats', (req, res) => {
  try {
    const clients = readData('clients');
    const factures = readData('factures');
    const operations = readData('operations');
    const bonsCommande = readData('bonsCommande');
    
    // Calculate stats
    const totalClients = clients.length;
    
    const facturesEnAttente = factures.filter(f => 
      f.statut === 'envoyee' || f.statut === 'en_retard'
    ).length;
    
    const chiffreAffaireMois = factures
      .filter(f => {
        const factureDate = new Date(f.dateEmission);
        const now = new Date();
        return factureDate.getMonth() === now.getMonth() && 
               factureDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, f) => sum + f.montantTTC, 0);
    
    const entrees = operations
      .filter(op => op.type === 'entree')
      .reduce((sum, op) => sum + op.montant, 0);
    
    const sorties = operations
      .filter(op => op.type === 'sortie')
      .reduce((sum, op) => sum + op.montant, 0);
    
    const soldeCaisse = entrees - sorties;
    
    // Recent activities
    const recentActivities = [
      ...factures.map(f => ({
        id: `facture-${f.id}`,
        type: 'facture',
        description: `Facture #${f.numero} créée`,
        montant: f.montantTTC,
        date: f.dateEmission
      })),
      ...operations.map(op => ({
        id: `operation-${op.id}`,
        type: op.type === 'entree' ? 'paiement' : 'depense',
        description: op.description,
        montant: op.montant,
        date: op.date
      })),
      ...bonsCommande.map(bc => ({
        id: `commande-${bc.id}`,
        type: 'commande',
        description: `Bon de commande #${bc.numero} ${bc.statut}`,
        montant: bc.montantTTC,
        date: bc.dateCreation
      }))
    ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
    
    res.status(200).json({
      success: true,
      data: {
        totalClients,
        facturesEnAttente,
        chiffreAffaireMois,
        soldeCaisse,
        recentActivities
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