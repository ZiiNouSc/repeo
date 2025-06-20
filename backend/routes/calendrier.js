const express = require('express');
const router = express.Router();
const { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} = require('../controllers/calendrierController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// Get all events
router.get('/events', protect, hasPermission('calendrier', 'lire'), getEvents);

// Create new event
router.post('/events', protect, hasPermission('calendrier', 'creer'), createEvent);

// Update event
router.put('/events/:id', protect, hasPermission('calendrier', 'modifier'), updateEvent);

// Delete event
router.delete('/events/:id', protect, hasPermission('calendrier', 'supprimer'), deleteEvent);

module.exports = router;