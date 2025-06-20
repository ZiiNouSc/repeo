const express = require('express');
const router = express.Router();
const { 
  getTickets, 
  getTicketById, 
  createTicket, 
  updateTicketStatus, 
  updateTicket 
} = require('../controllers/ticketController');
const { protect, admin, agency } = require('../middlewares/authMiddleware');

// Get all tickets
router.get('/', protect, getTickets);

// Get ticket by ID
router.get('/:id', protect, getTicketById);

// Create new ticket
router.post('/', protect, agency, createTicket);

// Update ticket status
router.put('/:id/status', protect, updateTicketStatus);

// Update ticket
router.put('/:id', protect, updateTicket);

module.exports = router;