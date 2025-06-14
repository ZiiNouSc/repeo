const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all events
router.get('/events', (req, res) => {
  try {
    // In a real app, you would filter events by user/agence
    const events = readData('events') || [];
    
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements',
      error: error.message
    });
  }
});

// Create new event
router.post('/events', (req, res) => {
  try {
    const { 
      title, 
      start, 
      end, 
      allDay = false, 
      type = 'autre', 
      clientId, 
      clientNom, 
      description, 
      location 
    } = req.body;
    
    if (!title || !start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const events = readData('events') || [];
    
    // Determine color based on type
    let color;
    switch (type) {
      case 'reservation':
        color = '#3B82F6'; // blue-500
        break;
      case 'rendez_vous':
        color = '#10B981'; // green-500
        break;
      case 'rappel':
        color = '#F59E0B'; // yellow-500
        break;
      case 'tache':
        color = '#8B5CF6'; // purple-500
        break;
      default:
        color = '#6B7280'; // gray-500
    }
    
    const newEvent = {
      id: generateId(),
      title,
      start: formatDate(start),
      end: formatDate(end),
      allDay,
      type,
      clientId,
      clientNom,
      description,
      location,
      color
    };
    
    events.push(newEvent);
    
    if (writeData('events', events)) {
      res.status(201).json({
        success: true,
        message: 'Événement créé avec succès',
        data: newEvent
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'événement',
      error: error.message
    });
  }
});

// Update event
router.put('/events/:id', (req, res) => {
  try {
    const { 
      title, 
      start, 
      end, 
      allDay, 
      type, 
      clientId, 
      clientNom, 
      description, 
      location 
    } = req.body;
    
    if (!title || !start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const events = readData('events') || [];
    const eventIndex = events.findIndex(e => e.id === req.params.id);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }
    
    // Determine color based on type
    let color;
    switch (type) {
      case 'reservation':
        color = '#3B82F6'; // blue-500
        break;
      case 'rendez_vous':
        color = '#10B981'; // green-500
        break;
      case 'rappel':
        color = '#F59E0B'; // yellow-500
        break;
      case 'tache':
        color = '#8B5CF6'; // purple-500
        break;
      default:
        color = '#6B7280'; // gray-500
    }
    
    events[eventIndex] = {
      ...events[eventIndex],
      title,
      start: formatDate(start),
      end: formatDate(end),
      allDay: allDay !== undefined ? allDay : events[eventIndex].allDay,
      type: type || events[eventIndex].type,
      clientId,
      clientNom,
      description,
      location,
      color
    };
    
    if (writeData('events', events)) {
      res.status(200).json({
        success: true,
        message: 'Événement mis à jour avec succès',
        data: events[eventIndex]
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'événement',
      error: error.message
    });
  }
});

// Delete event
router.delete('/events/:id', (req, res) => {
  try {
    const events = readData('events') || [];
    const eventIndex = events.findIndex(e => e.id === req.params.id);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }
    
    events.splice(eventIndex, 1);
    
    if (writeData('events', events)) {
      res.status(200).json({
        success: true,
        message: 'Événement supprimé avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'événement',
      error: error.message
    });
  }
});

module.exports = router;