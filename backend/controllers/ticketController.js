const asyncHandler = require('express-async-handler');
const Ticket = require('../models/ticketModel');
const Agence = require('../models/agenceModel');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private/Admin
const getTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({}).populate('agenceId', 'nom email telephone');
  
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
  const { agenceId, sujet, description, priorite = 'normale' } = req.body;
  
  if (!agenceId || !sujet || !description) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
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
  
  if (ticket) {
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
  } else {
    res.status(404).json({
      success: false,
      message: 'Ticket non trouvé'
    });
  }
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
  
  if (ticket) {
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
  } else {
    res.status(404).json({
      success: false,
      message: 'Ticket non trouvé'
    });
  }
});

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  updateTicket
};