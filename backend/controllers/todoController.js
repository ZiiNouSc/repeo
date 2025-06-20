const asyncHandler = require('express-async-handler');
const Todo = require('../models/todoModel');

// @desc    Get all todos
// @route   GET /api/todos
// @access  Private
const getTodos = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const todos = await Todo.find({});
  
  res.status(200).json({
    success: true,
    data: todos
  });
});

// @desc    Get todo by ID
// @route   GET /api/todos/:id
// @access  Private
const getTodoById = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  
  if (todo) {
    res.status(200).json({
      success: true,
      data: todo
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Tâche non trouvée'
    });
  }
});

// @desc    Create new todo
// @route   POST /api/todos
// @access  Private
const createTodo = asyncHandler(async (req, res) => {
  const { 
    titre, 
    description, 
    clientId, 
    dateEcheance, 
    priorite = 'normale', 
    type = 'tache', 
    assigneA 
  } = req.body;
  
  if (!titre || !dateEcheance) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  // If clientId is provided, get client name
  let clientNom = '';
  if (clientId) {
    // In a real app, fetch client name from database
    clientNom = 'Client Name'; // Placeholder
  }
  
  const todo = await Todo.create({
    titre,
    description: description || '',
    clientId,
    clientNom,
    dateEcheance,
    priorite,
    statut: 'en_attente',
    type,
    assigneA,
    agenceId
  });
  
  res.status(201).json({
    success: true,
    message: 'Tâche créée avec succès',
    data: todo
  });
});

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Private
const updateTodo = asyncHandler(async (req, res) => {
  const { 
    titre, 
    description, 
    clientId, 
    dateEcheance, 
    priorite, 
    statut, 
    type, 
    assigneA 
  } = req.body;
  
  if (!titre || !dateEcheance) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const todo = await Todo.findById(req.params.id);
  
  if (todo) {
    // If clientId is provided and different from current, get client name
    let clientNom = todo.clientNom;
    if (clientId && clientId !== todo.clientId) {
      // In a real app, fetch client name from database
      clientNom = 'Client Name'; // Placeholder
    }
    
    todo.titre = titre;
    todo.description = description || '';
    todo.clientId = clientId;
    todo.clientNom = clientNom;
    todo.dateEcheance = dateEcheance;
    todo.priorite = priorite || todo.priorite;
    todo.statut = statut || todo.statut;
    todo.type = type || todo.type;
    todo.assigneA = assigneA;
    
    const updatedTodo = await todo.save();
    
    res.status(200).json({
      success: true,
      message: 'Tâche mise à jour avec succès',
      data: updatedTodo
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Tâche non trouvée'
    });
  }
});

// @desc    Toggle todo status
// @route   PUT /api/todos/:id/toggle
// @access  Private
const toggleTodoStatus = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  
  if (todo) {
    // Cycle through statuses: en_attente -> en_cours -> termine -> en_attente
    const currentStatus = todo.statut;
    let newStatus;
    
    if (currentStatus === 'en_attente') {
      newStatus = 'en_cours';
    } else if (currentStatus === 'en_cours') {
      newStatus = 'termine';
    } else {
      newStatus = 'en_attente';
    }
    
    todo.statut = newStatus;
    
    const updatedTodo = await todo.save();
    
    res.status(200).json({
      success: true,
      message: 'Statut de la tâche mis à jour avec succès',
      data: updatedTodo
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Tâche non trouvée'
    });
  }
});

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  
  if (todo) {
    await Todo.deleteOne({ _id: todo._id });
    
    res.status(200).json({
      success: true,
      message: 'Tâche supprimée avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Tâche non trouvée'
    });
  }
});

module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodoStatus,
  deleteTodo
};