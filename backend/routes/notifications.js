const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all notifications
router.get('/', (req, res) => {
  try {
    // In a real app, you would filter notifications by user/agence
    const notifications = readData('notifications') || [];
    
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
router.post('/', (req, res) => {
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
    
    const notifications = readData('notifications') || [];
    
    const now = new Date();
    const newNotification = {
      id: generateId(),
      type,
      titre,
      message,
      destinataire,
      statut: sendNow ? 'envoye' : 'en_attente',
      priorite,
      dateCreation: formatDate(now),
      dateEnvoi: sendNow ? formatDate(now) : undefined
    };
    
    notifications.push(newNotification);
    
    if (writeData('notifications', notifications)) {
      res.status(201).json({
        success: true,
        message: 'Notification créée avec succès',
        data: newNotification
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la notification',
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:id/read', (req, res) => {
  try {
    const notifications = readData('notifications') || [];
    const notificationIndex = notifications.findIndex(n => n.id === req.params.id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    notifications[notificationIndex].statut = 'lu';
    notifications[notificationIndex].dateOuverture = formatDate(new Date());
    
    if (writeData('notifications', notifications)) {
      res.status(200).json({
        success: true,
        message: 'Notification marquée comme lue',
        data: notifications[notificationIndex]
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la notification',
      error: error.message
    });
  }
});

// Resend failed notification
router.post('/:id/resend', (req, res) => {
  try {
    const notifications = readData('notifications') || [];
    const notificationIndex = notifications.findIndex(n => n.id === req.params.id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    if (notifications[notificationIndex].statut !== 'echec') {
      return res.status(400).json({
        success: false,
        message: 'Seules les notifications en échec peuvent être renvoyées'
      });
    }
    
    notifications[notificationIndex].statut = 'envoye';
    notifications[notificationIndex].dateEnvoi = formatDate(new Date());
    notifications[notificationIndex].erreur = undefined;
    
    if (writeData('notifications', notifications)) {
      res.status(200).json({
        success: true,
        message: 'Notification renvoyée avec succès',
        data: notifications[notificationIndex]
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du renvoi de la notification',
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:id', (req, res) => {
  try {
    const notifications = readData('notifications') || [];
    const notificationIndex = notifications.findIndex(n => n.id === req.params.id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    notifications.splice(notificationIndex, 1);
    
    if (writeData('notifications', notifications)) {
      res.status(200).json({
        success: true,
        message: 'Notification supprimée avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la notification',
      error: error.message
    });
  }
});

// Get notification stats
router.get('/stats', (req, res) => {
  try {
    const notifications = readData('notifications') || [];
    
    const stats = {
      total: notifications.length,
      envoyes: notifications.filter(n => n.statut === 'envoye').length,
      enAttente: notifications.filter(n => n.statut === 'en_attente').length,
      echecs: notifications.filter(n => n.statut === 'echec').length,
      lus: notifications.filter(n => n.statut === 'lu').length
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