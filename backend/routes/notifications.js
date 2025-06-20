const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

// Get all notifications
router.get('/', protect, (req, res) => {
  try {
    // In a real app, you would filter notifications by user/agence
    const notifications = [
      {
        id: '1',
        type: 'email',
        titre: 'Confirmation de réservation',
        message: 'Votre réservation pour Rome a été confirmée. Détails en pièce jointe.',
        destinataire: 'martin.dubois@email.com',
        statut: 'envoye',
        priorite: 'normale',
        dateCreation: '2024-01-15T10:30:00Z',
        dateEnvoi: '2024-01-15T10:32:00Z',
        dateOuverture: '2024-01-15T11:45:00Z'
      },
      {
        id: '2',
        type: 'sms',
        titre: 'Rappel rendez-vous',
        message: 'Rappel: RDV demain 14h en agence pour finaliser votre dossier voyage.',
        destinataire: '+33 1 23 45 67 89',
        statut: 'envoye',
        priorite: 'haute',
        dateCreation: '2024-01-14T16:00:00Z',
        dateEnvoi: '2024-01-14T16:01:00Z'
      },
      {
        id: '3',
        type: 'email',
        titre: 'Facture en retard',
        message: 'Votre facture FAC-2024-001 est en retard de paiement. Merci de régulariser.',
        destinataire: 'sophie.martin@email.com',
        statut: 'echec',
        priorite: 'urgente',
        dateCreation: '2024-01-13T09:00:00Z',
        erreur: 'Adresse email invalide'
      },
      {
        id: '4',
        type: 'push',
        titre: 'Nouveau message',
        message: 'Vous avez reçu un nouveau message de votre conseiller voyage.',
        destinataire: 'Agent Mobile App',
        statut: 'en_attente',
        priorite: 'normale',
        dateCreation: '2024-01-15T14:20:00Z'
      }
    ];
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
});

// Create new notification
router.post('/', protect, (req, res) => {
  try {
    const { 
      type, 
      titre, 
      message, 
      destinataire, 
      priorite = 'normale',
      sendNow = true
    } = req.body;
    
    if (!type || !titre || !message || !destinataire) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const now = new Date();
    const newNotification = {
      id: Math.random().toString(36).substring(2, 15),
      type,
      titre,
      message,
      destinataire,
      statut: sendNow ? 'envoye' : 'en_attente',
      priorite,
      dateCreation: now.toISOString(),
      dateEnvoi: sendNow ? now.toISOString() : undefined
    };
    
    res.status(201).json({
      success: true,
      message: 'Notification créée avec succès',
      data: newNotification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la notification',
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:id/read', protect, (req, res) => {
  try {
    // In a real app, this would update the notification in the database
    const updatedNotification = {
      id: req.params.id,
      statut: 'lu',
      dateOuverture: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue',
      data: updatedNotification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la notification',
      error: error.message
    });
  }
});

// Get notification stats
router.get('/stats', protect, (req, res) => {
  try {
    const stats = {
      total: 4,
      envoyes: 2,
      enAttente: 1,
      echecs: 1,
      lus: 1
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

module.exports = router;