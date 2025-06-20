const asyncHandler = require('express-async-handler');
const BonCommande = require('../models/bonCommandeModel');
const Client = require('../models/clientModel');
const Facture = require('../models/factureModel');

// @desc    Get all bons de commande
// @route   GET /api/bons-commande
// @access  Private
const getBonsCommande = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const bonsCommande = await BonCommande.find({}).populate('clientId');
  
  // Format data to match frontend expectations
  const bonsCommandeWithClients = bonsCommande.map(bon => {
    const client = bon.clientId;
    return {
      id: bon._id,
      numero: bon.numero,
      clientId: client._id,
      dateCreation: bon.dateCreation,
      statut: bon.statut,
      montantHT: bon.montantHT,
      montantTTC: bon.montantTTC,
      articles: bon.articles,
      client: {
        id: client._id,
        nom: client.nom,
        prenom: client.prenom,
        entreprise: client.entreprise,
        email: client.email
      }
    };
  });
  
  res.status(200).json({
    success: true,
    data: bonsCommandeWithClients
  });
});

// @desc    Get bon de commande by ID
// @route   GET /api/bons-commande/:id
// @access  Private
const getBonCommandeById = asyncHandler(async (req, res) => {
  const bon = await BonCommande.findById(req.params.id).populate('clientId');
  
  if (bon) {
    const client = bon.clientId;
    
    const bonWithClient = {
      id: bon._id,
      numero: bon.numero,
      clientId: client._id,
      dateCreation: bon.dateCreation,
      statut: bon.statut,
      montantHT: bon.montantHT,
      montantTTC: bon.montantTTC,
      articles: bon.articles,
      client: {
        id: client._id,
        nom: client.nom,
        prenom: client.prenom,
        entreprise: client.entreprise,
        email: client.email
      }
    };
    
    res.status(200).json({
      success: true,
      data: bonWithClient
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Bon de commande non trouvé'
    });
  }
});

// @desc    Create new bon de commande
// @route   POST /api/bons-commande
// @access  Private
const createBonCommande = asyncHandler(async (req, res) => {
  const { clientId, articles, statut = 'brouillon' } = req.body;
  
  if (!clientId || !articles || !articles.length) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const client = await Client.findById(clientId);
  
  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client non trouvé'
    });
  }
  
  // Calculate totals
  const montantHT = articles.reduce((sum, article) => sum + article.montant, 0);
  const montantTTC = montantHT * 1.2; // Assuming 20% VAT
  
  // Generate bon de commande number
  const bonCount = await BonCommande.countDocuments();
  const numero = `BC-${new Date().getFullYear()}-${String(bonCount + 1).padStart(3, '0')}`;
  
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const bon = await BonCommande.create({
    numero,
    clientId,
    statut,
    montantHT,
    montantTTC,
    articles,
    agenceId
  });
  
  const bonWithClient = {
    id: bon._id,
    numero: bon.numero,
    clientId: client._id,
    dateCreation: bon.dateCreation,
    statut: bon.statut,
    montantHT: bon.montantHT,
    montantTTC: bon.montantTTC,
    articles: bon.articles,
    client: {
      id: client._id,
      nom: client.nom,
      prenom: client.prenom,
      entreprise: client.entreprise,
      email: client.email
    }
  };
  
  res.status(201).json({
    success: true,
    message: 'Bon de commande créé avec succès',
    data: bonWithClient
  });
});

// @desc    Update bon de commande
// @route   PUT /api/bons-commande/:id
// @access  Private
const updateBonCommande = asyncHandler(async (req, res) => {
  const { clientId, articles, statut } = req.body;
  
  if (!clientId || !articles || !articles.length) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const bon = await BonCommande.findById(req.params.id);
  
  if (bon) {
    const client = await Client.findById(clientId);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    // Calculate totals
    const montantHT = articles.reduce((sum, article) => sum + article.montant, 0);
    const montantTTC = montantHT * 1.2; // Assuming 20% VAT
    
    bon.clientId = clientId;
    bon.statut = statut || bon.statut;
    bon.montantHT = montantHT;
    bon.montantTTC = montantTTC;
    bon.articles = articles;
    
    const updatedBon = await bon.save();
    
    const bonWithClient = {
      id: updatedBon._id,
      numero: updatedBon.numero,
      clientId: client._id,
      dateCreation: updatedBon.dateCreation,
      statut: updatedBon.statut,
      montantHT: updatedBon.montantHT,
      montantTTC: updatedBon.montantTTC,
      articles: updatedBon.articles,
      client: {
        id: client._id,
        nom: client.nom,
        prenom: client.prenom,
        entreprise: client.entreprise,
        email: client.email
      }
    };
    
    res.status(200).json({
      success: true,
      message: 'Bon de commande mis à jour avec succès',
      data: bonWithClient
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Bon de commande non trouvé'
    });
  }
});

// @desc    Convert bon de commande to facture
// @route   POST /api/bons-commande/:id/convert
// @access  Private
const convertBonCommandeToFacture = asyncHandler(async (req, res) => {
  const bon = await BonCommande.findById(req.params.id);
  
  if (bon) {
    if (bon.statut !== 'accepte') {
      return res.status(400).json({
        success: false,
        message: 'Le bon de commande doit être accepté pour être converti en facture'
      });
    }
    
    // Update bon status
    bon.statut = 'facture';
    await bon.save();
    
    // Generate facture number
    const factureCount = await Facture.countDocuments();
    const numero = `FAC-${new Date().getFullYear()}-${String(factureCount + 1).padStart(3, '0')}`;
    
    // Set due date to 30 days from now
    const dateEmission = new Date();
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEcheance.getDate() + 30);
    
    // Create new facture
    const facture = await Facture.create({
      numero,
      clientId: bon.clientId,
      dateEmission,
      dateEcheance,
      statut: 'envoyee',
      montantHT: bon.montantHT,
      montantTTC: bon.montantTTC,
      articles: bon.articles,
      agenceId: bon.agenceId
    });
    
    const client = await Client.findById(bon.clientId);
    
    const factureWithClient = {
      id: facture._id,
      numero: facture.numero,
      clientId: client._id,
      dateEmission: facture.dateEmission,
      dateEcheance: facture.dateEcheance,
      statut: facture.statut,
      montantHT: facture.montantHT,
      montantTTC: facture.montantTTC,
      articles: facture.articles,
      client: {
        id: client._id,
        nom: client.nom,
        prenom: client.prenom,
        entreprise: client.entreprise,
        email: client.email
      }
    };
    
    res.status(201).json({
      success: true,
      message: 'Bon de commande converti en facture avec succès',
      data: factureWithClient
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Bon de commande non trouvé'
    });
  }
});

// @desc    Delete bon de commande
// @route   DELETE /api/bons-commande/:id
// @access  Private
const deleteBonCommande = asyncHandler(async (req, res) => {
  const bon = await BonCommande.findById(req.params.id);
  
  if (bon) {
    await BonCommande.deleteOne({ _id: bon._id });
    
    res.status(200).json({
      success: true,
      message: 'Bon de commande supprimé avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Bon de commande non trouvé'
    });
  }
});

module.exports = {
  getBonsCommande,
  getBonCommandeById,
  createBonCommande,
  updateBonCommande,
  convertBonCommandeToFacture,
  deleteBonCommande
};