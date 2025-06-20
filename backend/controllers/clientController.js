const asyncHandler = require('express-async-handler');
const Client = require('../models/clientModel');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = asyncHandler(async (req, res) => {
  // Filter by agency ID from authenticated user
  const agenceId = req.user?.agenceId || req.query.agenceId;
  
  let query = {};
  if (agenceId) {
    query.agenceId = agenceId;
  }
  
  const clients = await Client.find(query);
  
  res.status(200).json({
    success: true,
    data: clients
  });
});

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Private
const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  
  if (client) {
    res.status(200).json({
      success: true,
      data: client
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Client non trouvé'
    });
  }
});

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
const createClient = asyncHandler(async (req, res) => {
  const { nom, prenom, entreprise, email, telephone, adresse } = req.body;
  
  if (!nom || !email || !telephone || !adresse) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  // Get agenceId from authenticated user or from request body
  const agenceId = req.user?.agenceId || req.body.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const client = await Client.create({
    nom,
    prenom: prenom || '',
    entreprise: entreprise || '',
    email,
    telephone,
    adresse,
    solde: 0,
    agenceId
  });
  
  res.status(201).json({
    success: true,
    message: 'Client créé avec succès',
    data: client
  });
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = asyncHandler(async (req, res) => {
  const { nom, prenom, entreprise, email, telephone, adresse } = req.body;
  
  if (!nom || !email || !telephone || !adresse) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const client = await Client.findById(req.params.id);
  
  if (client) {
    client.nom = nom;
    client.prenom = prenom || '';
    client.entreprise = entreprise || '';
    client.email = email;
    client.telephone = telephone;
    client.adresse = adresse;
    
    const updatedClient = await client.save();
    
    res.status(200).json({
      success: true,
      message: 'Client mis à jour avec succès',
      data: updatedClient
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Client non trouvé'
    });
  }
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  
  if (client) {
    await Client.deleteOne({ _id: client._id });
    
    res.status(200).json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Client non trouvé'
    });
  }
});

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};