const asyncHandler = require('express-async-handler');
const Reservation = require('../models/reservationModel');

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private
const getReservations = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const reservations = await Reservation.find({});
  
  res.status(200).json({
    success: true,
    data: reservations
  });
});

// @desc    Get reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  
  if (reservation) {
    res.status(200).json({
      success: true,
      data: reservation
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Réservation non trouvée'
    });
  }
});

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = asyncHandler(async (req, res) => {
  const { 
    clientId, 
    clientNom, 
    type, 
    destination, 
    dateDepart, 
    dateRetour, 
    nombrePersonnes, 
    montant, 
    statut = 'en_attente',
    notes 
  } = req.body;
  
  if (!clientId || !clientNom || !type || !destination || !dateDepart || !dateRetour || !nombrePersonnes || !montant) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  // Generate reservation number
  const reservationCount = await Reservation.countDocuments();
  const numero = `RES-${new Date().getFullYear()}-${String(reservationCount + 1).padStart(3, '0')}`;
  
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const reservation = await Reservation.create({
    numero,
    clientId,
    clientNom,
    type,
    destination,
    dateDepart,
    dateRetour,
    nombrePersonnes: parseInt(nombrePersonnes),
    montant: parseFloat(montant),
    statut,
    notes,
    agenceId
  });
  
  res.status(201).json({
    success: true,
    message: 'Réservation créée avec succès',
    data: reservation
  });
});

// @desc    Update reservation
// @route   PUT /api/reservations/:id
// @access  Private
const updateReservation = asyncHandler(async (req, res) => {
  const { 
    clientId, 
    clientNom, 
    type, 
    destination, 
    dateDepart, 
    dateRetour, 
    nombrePersonnes, 
    montant, 
    statut,
    notes 
  } = req.body;
  
  if (!clientId || !clientNom || !type || !destination || !dateDepart || !dateRetour || !nombrePersonnes || !montant) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const reservation = await Reservation.findById(req.params.id);
  
  if (reservation) {
    reservation.clientId = clientId;
    reservation.clientNom = clientNom;
    reservation.type = type;
    reservation.destination = destination;
    reservation.dateDepart = dateDepart;
    reservation.dateRetour = dateRetour;
    reservation.nombrePersonnes = parseInt(nombrePersonnes);
    reservation.montant = parseFloat(montant);
    reservation.statut = statut || reservation.statut;
    reservation.notes = notes;
    
    const updatedReservation = await reservation.save();
    
    res.status(200).json({
      success: true,
      message: 'Réservation mise à jour avec succès',
      data: updatedReservation
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Réservation non trouvée'
    });
  }
});

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private
const updateReservationStatus = asyncHandler(async (req, res) => {
  const { statut } = req.body;
  
  if (!statut || !['en_attente', 'confirmee', 'annulee', 'terminee'].includes(statut)) {
    return res.status(400).json({
      success: false,
      message: 'Statut invalide'
    });
  }
  
  const reservation = await Reservation.findById(req.params.id);
  
  if (reservation) {
    reservation.statut = statut;
    
    const updatedReservation = await reservation.save();
    
    res.status(200).json({
      success: true,
      message: 'Statut de la réservation mis à jour avec succès',
      data: updatedReservation
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Réservation non trouvée'
    });
  }
});

// @desc    Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  
  if (reservation) {
    await Reservation.deleteOne({ _id: reservation._id });
    
    res.status(200).json({
      success: true,
      message: 'Réservation supprimée avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Réservation non trouvée'
    });
  }
});

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation
};