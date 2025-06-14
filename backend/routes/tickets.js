const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all tickets
router.get('/', (req, res) => {
  try {
    const tickets = readData('tickets');
    const agences = readData('agences');
    
    // Attach agence data to each ticket
    const ticketsWithAgences = tickets.map(ticket => {
      const agence = agences.find(a => a.id === ticket.agenceId) || {};
      return { ...ticket, agence };
    });
    
    res.status(200).json({
      success: true,
      data: ticketsWithAgences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tickets',
      error: error.message
    });
  }
});

// Get ticket by ID
router.get('/:id', (req, res) => {
  try {
    const tickets = readData('tickets');
    const agences = readData('agences');
    
    const ticket = tickets.find(t => t.id === req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }
    
    const agence = agences.find(a => a.id === ticket.agenceId) || {};
    const ticketWithAgence = { ...ticket, agence };
    
    res.status(200).json({
      success: true,
      data: ticketWithAgence
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du ticket',
      error: error.message
    });
  }
});

// Create new ticket
router.post('/', (req, res) => {
  try {
    const { agenceId, sujet, description, priorite = 'normale' } = req.body;
    
    if (!agenceId || !sujet || !description) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const agences = readData('agences');
    const agence = agences.find(a => a.id === agenceId);
    
    if (!agence) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    const tickets = readData('tickets');
    
    const now = new Date();
    const newTicket = {
      id: generateId(),
      agenceId,
      sujet,
      description,
      statut: 'ouvert',
      priorite,
      dateCreation: formatDate(now),
      dateMAJ: formatDate(now)
    };
    
    tickets.push(newTicket);
    
    if (writeData('tickets', tickets)) {
      // Add agence data to response
      const ticketWithAgence = { ...newTicket, agence };
      
      res.status(201).json({
        success: true,
        message: 'Ticket créé avec succès',
        data: ticketWithAgence
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du ticket',
      error: error.message
    });
  }
});

// Update ticket status
router.put('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['ouvert', 'en_cours', 'ferme'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    const tickets = readData('tickets');
    const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
    
    if (ticketIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }
    
    tickets[ticketIndex].statut = status;
    tickets[ticketIndex].dateMAJ = formatDate(new Date());
    
    if (writeData('tickets', tickets)) {
      // Get agence data
      const agences = readData('agences');
      const agence = agences.find(a => a.id === tickets[ticketIndex].agenceId) || {};
      
      res.status(200).json({
        success: true,
        message: 'Statut du ticket mis à jour avec succès',
        data: { ...tickets[ticketIndex], agence }
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
});

// Update ticket
router.put('/:id', (req, res) => {
  try {
    const { sujet, description, priorite } = req.body;
    
    if (!sujet || !description || !priorite) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const tickets = readData('tickets');
    const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
    
    if (ticketIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }
    
    tickets[ticketIndex] = {
      ...tickets[ticketIndex],
      sujet,
      description,
      priorite,
      dateMAJ: formatDate(new Date())
    };
    
    if (writeData('tickets', tickets)) {
      // Get agence data
      const agences = readData('agences');
      const agence = agences.find(a => a.id === tickets[ticketIndex].agenceId) || {};
      
      res.status(200).json({
        success: true,
        message: 'Ticket mis à jour avec succès',
        data: { ...tickets[ticketIndex], agence }
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du ticket',
      error: error.message
    });
  }
});

module.exports = router;