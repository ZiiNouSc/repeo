const express = require('express');
const router = express.Router();
const { 
  getReservations, 
  getReservationById, 
  createReservation, 
  updateReservation, 
  updateReservationStatus, 
  deleteReservation 
} = require('../controllers/reservationController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// Get all reservations
router.get('/', protect, hasPermission('reservations', 'lire'), getReservations);

// Get reservation by ID
router.get('/:id', protect, hasPermission('reservations', 'lire'), getReservationById);

// Create new reservation
router.post('/', protect, hasPermission('reservations', 'creer'), createReservation);

// Update reservation
router.put('/:id', protect, hasPermission('reservations', 'modifier'), updateReservation);

// Update reservation status
router.put('/:id/status', protect, hasPermission('reservations', 'modifier'), updateReservationStatus);

// Delete reservation
router.delete('/:id', protect, hasPermission('reservations', 'supprimer'), deleteReservation);

module.exports = router;