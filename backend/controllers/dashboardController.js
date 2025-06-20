const asyncHandler = require('express-async-handler');
const Agence = require('../models/agenceModel');
const Client = require('../models/clientModel');
const Facture = require('../models/factureModel');
const Operation = require('../models/operationModel');
const BonCommande = require('../models/bonCommandeModel');
const Ticket = require('../models/ticketModel');

// @desc    Get general dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const clients = await Client.find({ agenceId });
  const factures = await Facture.find({ agenceId });
  const operations = await Operation.find({ agenceId });
  const bonsCommande = await BonCommande.find({ agenceId });
  
  // Calculate stats
  const totalClients = clients.length;
  
  const facturesEnAttente = factures.filter(f => 
    f.statut === 'envoyee' || f.statut === 'en_retard'
  ).length;
  
  const now = new Date();
  const chiffreAffaireMois = factures
    .filter(f => {
      const factureDate = new Date(f.dateEmission);
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
      id: `facture-${f._id}`,
      type: 'facture',
      description: `Facture #${f.numero} créée`,
      montant: f.montantTTC,
      date: f.dateEmission
    })),
    ...operations.map(op => ({
      id: `operation-${op._id}`,
      type: op.type === 'entree' ? 'paiement' : 'depense',
      description: op.description,
      montant: op.montant,
      date: op.date
    })),
    ...bonsCommande.map(bc => ({
      id: `commande-${bc._id}`,
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
});

// @desc    Get superadmin dashboard stats
// @route   GET /api/dashboard/superadmin/stats
// @access  Private/Admin
const getSuperadminStats = asyncHandler(async (req, res) => {
  const agences = await Agence.find({});
  const tickets = await Ticket.find({}).populate('agenceId', 'nom email');
  
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
      return {
        id: ticket._id,
        agenceId: ticket.agenceId._id,
        sujet: ticket.sujet,
        description: ticket.description,
        statut: ticket.statut,
        priorite: ticket.priorite,
        dateCreation: ticket.dateCreation,
        dateMAJ: ticket.dateMAJ,
        agence: {
          nom: ticket.agenceId.nom,
          email: ticket.agenceId.email
        }
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
});

// @desc    Get agence dashboard stats
// @route   GET /api/dashboard/agence/stats
// @access  Private/Agency
const getAgenceStats = asyncHandler(async (req, res) => {
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const clients = await Client.find({ agenceId });
  const factures = await Facture.find({ agenceId });
  const operations = await Operation.find({ agenceId });
  const bonsCommande = await BonCommande.find({ agenceId });
  
  // Calculate stats
  const totalClients = clients.length;
  
  const facturesEnAttente = factures.filter(f => 
    f.statut === 'envoyee' || f.statut === 'en_retard'
  ).length;
  
  const now = new Date();
  const chiffreAffaireMois = factures
    .filter(f => {
      const factureDate = new Date(f.dateEmission);
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
      id: `facture-${f._id}`,
      type: 'facture',
      description: `Facture #${f.numero} créée`,
      montant: f.montantTTC,
      date: f.dateEmission
    })),
    ...operations.map(op => ({
      id: `operation-${op._id}`,
      type: op.type === 'entree' ? 'paiement' : 'depense',
      description: op.description,
      montant: op.montant,
      date: op.date
    })),
    ...bonsCommande.map(bc => ({
      id: `commande-${bc._id}`,
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
});

module.exports = {
  getStats,
  getSuperadminStats,
  getAgenceStats
};