const asyncHandler = require('express-async-handler');
const Facture = require('../models/factureModel');
const Client = require('../models/clientModel');

// @desc    Get all factures
// @route   GET /api/factures
// @access  Private
const getFactures = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const factures = await Facture.find({}).populate('clientId');
  
  // Format data to match frontend expectations
  const facturesWithClients = factures.map(facture => {
    const client = facture.clientId;
    return {
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
  });
  
  res.status(200).json({
    success: true,
    data: facturesWithClients
  });
});

// @desc    Get facture by ID
// @route   GET /api/factures/:id
// @access  Private
const getFactureById = asyncHandler(async (req, res) => {
  const facture = await Facture.findById(req.params.id).populate('clientId');
  
  if (facture) {
    const client = facture.clientId;
    
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
    
    res.status(200).json({
      success: true,
      data: factureWithClient
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Facture non trouvée'
    });
  }
});

// @desc    Create new facture
// @route   POST /api/factures
// @access  Private
const createFacture = asyncHandler(async (req, res) => {
  const { clientId, dateEmission, dateEcheance, articles, statut = 'brouillon' } = req.body;
  
  if (!clientId || !dateEmission || !dateEcheance || !articles || !articles.length) {
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
  
  // Generate facture number
  const factureCount = await Facture.countDocuments();
  const numero = `FAC-${new Date().getFullYear()}-${String(factureCount + 1).padStart(3, '0')}`;
  
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const facture = await Facture.create({
    numero,
    clientId,
    dateEmission,
    dateEcheance,
    statut,
    montantHT,
    montantTTC,
    articles,
    agenceId
  });
  
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
    message: 'Facture créée avec succès',
    data: factureWithClient
  });
});

// @desc    Update facture
// @route   PUT /api/factures/:id
// @access  Private
const updateFacture = asyncHandler(async (req, res) => {
  const { clientId, dateEmission, dateEcheance, articles, statut } = req.body;
  
  if (!clientId || !dateEmission || !dateEcheance || !articles || !articles.length) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const facture = await Facture.findById(req.params.id);
  
  if (facture) {
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
    
    facture.clientId = clientId;
    facture.dateEmission = dateEmission;
    facture.dateEcheance = dateEcheance;
    facture.statut = statut || facture.statut;
    facture.montantHT = montantHT;
    facture.montantTTC = montantTTC;
    facture.articles = articles;
    
    const updatedFacture = await facture.save();
    
    const factureWithClient = {
      id: updatedFacture._id,
      numero: updatedFacture.numero,
      clientId: client._id,
      dateEmission: updatedFacture.dateEmission,
      dateEcheance: updatedFacture.dateEcheance,
      statut: updatedFacture.statut,
      montantHT: updatedFacture.montantHT,
      montantTTC: updatedFacture.montantTTC,
      articles: updatedFacture.articles,
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
      message: 'Facture mise à jour avec succès',
      data: factureWithClient
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Facture non trouvée'
    });
  }
});

// @desc    Mark facture as paid
// @route   PUT /api/factures/:id/pay
// @access  Private
const markFactureAsPaid = asyncHandler(async (req, res) => {
  const facture = await Facture.findById(req.params.id);
  
  if (facture) {
    facture.statut = 'payee';
    const updatedFacture = await facture.save();
    
    const client = await Client.findById(facture.clientId);
    
    const factureWithClient = {
      id: updatedFacture._id,
      numero: updatedFacture.numero,
      clientId: client._id,
      dateEmission: updatedFacture.dateEmission,
      dateEcheance: updatedFacture.dateEcheance,
      statut: updatedFacture.statut,
      montantHT: updatedFacture.montantHT,
      montantTTC: updatedFacture.montantTTC,
      articles: updatedFacture.articles,
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
      message: 'Facture marquée comme payée',
      data: factureWithClient
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Facture non trouvée'
    });
  }
});

// @desc    Delete facture
// @route   DELETE /api/factures/:id
// @access  Private
const deleteFacture = asyncHandler(async (req, res) => {
  const facture = await Facture.findById(req.params.id);
  
  if (facture) {
    await Facture.deleteOne({ _id: facture._id });
    
    res.status(200).json({
      success: true,
      message: 'Facture supprimée avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Facture non trouvée'
    });
  }
});

// @desc    Generate PDF for facture
// @route   GET /api/factures/:id/pdf
// @access  Private
const generateFacturePDF = asyncHandler(async (req, res) => {
  // In a real app, this would generate a PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="facture-${req.params.id}.pdf"`);
  
  // Send a placeholder PDF (just some text)
  res.send('This is a placeholder for a PDF file');
});

module.exports = {
  getFactures,
  getFactureById,
  createFacture,
  updateFacture,
  markFactureAsPaid,
  deleteFacture,
  generateFacturePDF
};