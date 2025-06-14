const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all reservations
router.get('/', (req, res) => {
  try {
    const reservations = readData('reservations');
    res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message
    });
  }
});

// Get reservation by ID
router.get('/:id', (req, res) => {
  try {
    const reservations = readData('reservations');
    const reservation = reservations.find(r => r.id === req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation',
      error: error.message
    });
  }
});

// Create new reservation
router.post('/', (req, res) => {
  try {
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
    
    const reservations = readData('reservations');
    
    // Generate reservation number
    const reservationCount = reservations.length + 1;
    const numero = `RES-${new Date().getFullYear()}-${String(reservationCount).padStart(3, '0')}`;
    
    const newReservation = {
      id: generateId(),
      numero,
      clientId,
      clientNom,
      type,
      destination,
      dateDepart: formatDate(dateDepart),
      dateRetour: formatDate(dateRetour),
      nombrePersonnes: parseInt(nombrePersonnes),
      montant: parseFloat(montant),
      statut,
      dateCreation: formatDate(new Date()),
      notes
    };
    
    reservations.push(newReservation);
    
    if (writeData('reservations', reservations)) {
      res.status(201).json({
        success: true,
        message: 'Réservation créée avec succès',
        data: newReservation
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      error: error.message
    });
  }
});

// Update reservation
router.put('/:id', (req, res) => {
  try {
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
    
    const reservations = readData('reservations');
    const reservationIndex = reservations.findIndex(r => r.id === req.params.id);
    
    if (reservationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }
    
    const updatedReservation = {
      ...reservations[reservationIndex],
      clientId,
      clientNom,
      type,
      destination,
      dateDepart: formatDate(dateDepart),
      dateRetour: formatDate(dateRetour),
      nombrePersonnes: parseInt(nombrePersonnes),
      montant: parseFloat(montant),
      statut: statut || reservations[reservationIndex].statut,
      notes
    };
    
    reservations[reservationIndex] = updatedReservation;
    
    if (writeData('reservations', reservations)) {
      res.status(200).json({
        success: true,
        message: 'Réservation mise à jour avec succès',
        data: updatedReservation
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la réservation',
      error: error.message
    });
  }
});

// Update reservation status
router.put('/:id/status', (req, res) => {
  try {
    const { statut } = req.body;
    
    if (!statut || !['en_attente', 'confirmee', 'annulee', 'terminee'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    const reservations = readData('reservations');
    const reservationIndex = reservations.findIndex(r => r.id === req.params.id);
    
    if (reservationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }
    
    reservations[reservationIndex].statut = statut;
    
    if (writeData('reservations', reservations)) {
      res.status(200).json({
        success: true,
        message: 'Statut de la réservation mis à jour avec succès',
        data: reservations[reservationIndex]
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

// Delete reservation
router.delete('/:id', (req, res) => {
  try {
    const reservations = readData('reservations');
    const reservationIndex = reservations.findIndex(r => r.id === req.params.id);
    
    if (reservationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }
    
    reservations.splice(reservationIndex, 1);
    
    if (writeData('reservations', reservations)) {
      res.status(200).json({
        success: true,
        message: 'Réservation supprimée avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la réservation',
      error: error.message
    });
  }
});

module.exports = router;