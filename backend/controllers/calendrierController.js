const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');

// @desc    Get all events
// @route   GET /api/calendrier/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const events = await Event.find({ agenceId });
  
  res.status(200).json({
    success: true,
    data: events
  });
});

// @desc    Create new event
// @route   POST /api/calendrier/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
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
  
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
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
  
  const event = await Event.create({
    title,
    start,
    end,
    allDay,
    type,
    clientId,
    clientNom,
    description,
    location,
    color,
    agenceId
  });
  
  res.status(201).json({
    success: true,
    message: 'Événement créé avec succès',
    data: event
  });
});

// @desc    Update event
// @route   PUT /api/calendrier/events/:id
// @access  Private
const updateEvent = asyncHandler(async (req, res) => {
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
  
  const event = await Event.findById(req.params.id);
  
  if (event) {
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
    
    event.title = title;
    event.start = start;
    event.end = end;
    event.allDay = allDay !== undefined ? allDay : event.allDay;
    event.type = type || event.type;
    event.clientId = clientId;
    event.clientNom = clientNom;
    event.description = description;
    event.location = location;
    event.color = color;
    
    const updatedEvent = await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Événement mis à jour avec succès',
      data: updatedEvent
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Événement non trouvé'
    });
  }
});

// @desc    Delete event
// @route   DELETE /api/calendrier/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (event) {
    await Event.deleteOne({ _id: event._id });
    
    res.status(200).json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Événement non trouvé'
    });
  }
});

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
};