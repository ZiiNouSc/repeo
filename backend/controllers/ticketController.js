const asyncHandler = require('express-async-handler');
const Ticket = require('../models/ticketModel');
const Agence = require('../models/agenceModel');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = asyncHandler(async (req, res) => {
  let query = {};
  
  // Si l'utilisateur est une agence, filtrer par son ID d'agence
  if (req.user.role === 'agence') {
    query.agenceId = req.user.agenceId;
  }
  
  const tickets = await Ticket.find(query).populate('agenceId', 'nom email telephone');
  
  // Format data to match frontend expectations
  const ticketsWithAgences = tickets.map(ticket => {
    return {
      id: ticket._id,
      agenceId: ticket.agenceId._id,
      sujet: ticket.sujet,
      description: ticket.description,
      statut: ticket.statut,
      priorite: ticket.priorite,
      dateCreation: ticket.dateCreation,
      dateMAJ: ticket.dateMAJ,
      reponses: ticket.reponses || [],
      agence: {
        nom: ticket.agenceId.nom,
        email: ticket.agenceId.email,
        telephone: ticket.agenceId.telephone
      }
    };
  });
  
  res.status(200).json({
    success: true,
    data: ticketsWithAgences
  });
});

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate('agenceId', 'nom email telephone');
  
  // Vérifier que l'utilisateur a accès à ce ticket
  if (req.user.role !== 'superadmin' && req.user.agenceId.toString() !== ticket.agenceId._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé à ce ticket'
    });
  }
  
  if (ticket) {
    const ticketWithAgence = {
      id: ticket._id,
      agenceId: ticket.agenceId._id,
      sujet: ticket.sujet,
      description: ticket.description,
      statut: ticket.statut,
      priorite: ticket.priorite,
      dateCreation: ticket.dateCreation,
      dateMAJ: ticket.dateMAJ,
      reponses: ticket.reponses || [],
      agence: {
        nom: ticket.agenceId.nom,
        email: ticket.agenceId.email,
        telephone: ticket.agenceId.telephone
      }
    };
    
    res.status(200).json({
      success: true,
      data: ticketWithAgence
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Ticket non trouvé'
    });
  }
});

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { sujet, description, priorite = 'normale' } = req.body;
  
  if (!sujet || !description) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  // Si l'utilisateur est une agence, utiliser son ID d'agence
  const agenceId = req.user.agenceId;
  
  if (!agenceId) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'agence manquant'
    });
  }
  
  const agence = await Agence.findById(agenceId);
  
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
  
  const ticket = await Ticket.create({
    agenceId,
    sujet,
    description,
    statut: 'ouvert',
    priorite,
    dateMAJ: Date.now()
  });
  
  const ticketWithAgence = {
    id: ticket._id,
    agenceId: agence._id,
    sujet: ticket.sujet,
    description: ticket.description,
    statut: ticket.statut,
    priorite: ticket.priorite,
    dateCreation: ticket.dateCreation,
    dateMAJ: ticket.dateMAJ,
    reponses: [],
    agence: {
      nom: agence.nom,
      email: agence.email,
      telephone: agence.telephone
    }
  };
  
  res.status(201).json({
    success: true,
    message: 'Ticket créé avec succès',
    data: ticketWithAgence
  });
});

// @desc    Reply to a ticket
// @route   POST /api/tickets/:id/reply
// @access  Private
const replyToTicket = asyncHandler(async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message manquant'
    });
  }
  
  const ticket = await Ticket.findById(req.params.id);
  
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket non trouvé'
    });
  }
  
  // Vérifier que l'utilisateur a accès à ce ticket
  if (req.user.role !== 'superadmin' && req.user.agenceId.toString() !== ticket.agenceId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé à ce ticket'
    });
  }
  
  // Ajouter la réponse
  const reponse = {
    message,
    userId: req.user._id,
    userName: `${req.user.prenom} ${req.user.nom}`,
    userRole: req.user.role,
    date: Date.now()
  };
  
  ticket.reponses.push(reponse);
  
  // Mettre à jour le statut du ticket
  if (req.user.role === 'superadmin' && ticket.statut === 'ouvert') {
    ticket.statut = 'en_cours';
  }
  
  ticket.dateMAJ = Date.now();
  
  await ticket.save();
  
  res.status(200).json({
    success: true,
    message: 'Réponse ajoutée avec succès',
    data: {
      id: ticket._id,
      reponses: ticket.reponses,
      statut: ticket.statut,
      dateMAJ: ticket.dateMAJ
    }
  });
});

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status || !['ouvert', 'en_cours', 'ferme'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Statut invalide'
    });
  }
  
  const ticket = await Ticket.findById(req.params.id).populate('agenceId', 'nom email telephone');
  
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket non trouvé'
    });
  }
  
  // Vérifier que l'utilisateur a accès à ce ticket
  if (req.user.role !== 'superadmin' && req.user.agenceId.toString() !== ticket.agenceId._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé à ce ticket'
    });
  }
  
  ticket.statut = status;
  ticket.dateMAJ = Date.now();
  
  const updatedTicket = await ticket.save();
  
  const ticketWithAgence = {
    id: updatedTicket._id,
    agenceId: ticket.agenceId._id,
    sujet: updatedTicket.sujet,
    description: updatedTicket.description,
    statut: updatedTicket.statut,
    priorite: updatedTicket.priorite,
    dateCreation: updatedTicket.dateCreation,
    dateMAJ: updatedTicket.dateMAJ,
    reponses: updatedTicket.reponses || [],
    agence: {
      nom: ticket.agenceId.nom,
      email: ticket.agenceId.email,
      telephone: ticket.agenceId.telephone
    }
  };
  
  res.status(200).json({
    success: true,
    message: 'Statut du ticket mis à jour avec succès',
    data: ticketWithAgence
  });
});

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = asyncHandler(async (req, res) => {
  const { sujet, description, priorite } = req.body;
  
  if (!sujet || !description || !priorite) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const ticket = await Ticket.findById(req.params.id).populate('agenceId', 'nom email telephone');
  
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket non trouvé'
    });
  }
  
  // Vérifier que l'utilisateur a accès à ce ticket
  if (req.user.role !== 'superadmin' && req.user.agenceId.toString() !== ticket.agenceId._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé à ce ticket'
    });
  }
  
  ticket.sujet = sujet;
  ticket.description = description;
  ticket.priorite = priorite;
  ticket.dateMAJ = Date.now();
  
  const updatedTicket = await ticket.save();
  
  const ticketWithAgence = {
    id: updatedTicket._id,
    agenceId: ticket.agenceId._id,
    sujet: updatedTicket.sujet,
    description: updatedTicket.description,
    statut: updatedTicket.statut,
    priorite: updatedTicket.priorite,
    dateCreation: updatedTicket.dateCreation,
    dateMAJ: updatedTicket.dateMAJ,
    reponses: updatedTicket.reponses || [],
    agence: {
      nom: ticket.agenceId.nom,
      email: ticket.agenceId.email,
      telephone: ticket.agenceId.telephone
    }
  };
  
  res.status(200).json({
    success: true,
    message: 'Ticket mis à jour avec succès',
    data: ticketWithAgence
  });
});

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  replyToTicket,
  updateTicketStatus,
  updateTicket
};