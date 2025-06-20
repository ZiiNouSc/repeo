const asyncHandler = require('express-async-handler');
const Client = require('../models/clientModel');
const mongoose = require('mongoose');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = asyncHandler(async (req, res) => {
  // Filter by agency ID from authenticated user or query parameter
  const agenceId = req.query.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  let query = {};
  if (agenceId) {
    query.agenceId = agenceId;
  }
  
  const clients = await Client.find(query);
  
  // Format response to match frontend expectations
  const formattedClients = clients.map(client => ({
    id: client._id,
    nom: client.nom,
    prenom: client.prenom,
    entreprise: client.entreprise,
    email: client.email,
    telephone: client.telephone,
    adresse: client.adresse,
    solde: client.solde,
    dateCreation: client.dateCreation
  }));
  
  res.status(200).json({
    success: true,
    data: formattedClients
  });
});

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Private
const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  
  if (client) {
    // Format response to match frontend expectations
    const formattedClient = {
      id: client._id,
      nom: client.nom,
      prenom: client.prenom,
      entreprise: client.entreprise,
      email: client.email,
      telephone: client.telephone,
      adresse: client.adresse,
      solde: client.solde,
      dateCreation: client.dateCreation
    };
    
    res.status(200).json({
      success: true,
      data: formattedClient
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
  const agenceId = req.body.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
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
  
  // Format response to match frontend expectations
  const formattedClient = {
    id: client._id,
    nom: client.nom,
    prenom: client.prenom,
    entreprise: client.entreprise,
    email: client.email,
    telephone: client.telephone,
    adresse: client.adresse,
    solde: client.solde,
    dateCreation: client.dateCreation
  };
  
  res.status(201).json({
    success: true,
    message: 'Client créé avec succès',
    data: formattedClient
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
    
    // Format response to match frontend expectations
    const formattedClient = {
      id: updatedClient._id,
      nom: updatedClient.nom,
      prenom: updatedClient.prenom,
      entreprise: updatedClient.entreprise,
      email: updatedClient.email,
      telephone: updatedClient.telephone,
      adresse: updatedClient.adresse,
      solde: updatedClient.solde,
      dateCreation: updatedClient.dateCreation
    };
    
    res.status(200).json({
      success: true,
      message: 'Client mis à jour avec succès',
      data: formattedClient
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