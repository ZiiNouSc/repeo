const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all todos
router.get('/', (req, res) => {
  try {
    const todos = readData('todos');
    res.status(200).json({
      success: true,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tâches',
      error: error.message
    });
  }
});

// Get todo by ID
router.get('/:id', (req, res) => {
  try {
    const todos = readData('todos');
    const todo = todos.find(t => t.id === req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la tâche',
      error: error.message
    });
  }
});

// Create new todo
router.post('/', (req, res) => {
  try {
    const { 
      titre, 
      description, 
      clientId, 
      clientNom, 
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
    
    const todos = readData('todos');
    
    const newTodo = {
      id: generateId(),
      titre,
      description: description || '',
      clientId,
      clientNom,
      dateEcheance: formatDate(dateEcheance),
      priorite,
      statut: 'en_attente',
      type,
      dateCreation: formatDate(new Date()),
      assigneA
    };
    
    todos.push(newTodo);
    
    if (writeData('todos', todos)) {
      res.status(201).json({
        success: true,
        message: 'Tâche créée avec succès',
        data: newTodo
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la tâche',
      error: error.message
    });
  }
});

// Update todo
router.put('/:id', (req, res) => {
  try {
    const { 
      titre, 
      description, 
      clientId, 
      clientNom, 
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
    
    const todos = readData('todos');
    const todoIndex = todos.findIndex(t => t.id === req.params.id);
    
    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }
    
    const updatedTodo = {
      ...todos[todoIndex],
      titre,
      description: description || '',
      clientId,
      clientNom,
      dateEcheance: formatDate(dateEcheance),
      priorite: priorite || todos[todoIndex].priorite,
      statut: statut || todos[todoIndex].statut,
      type: type || todos[todoIndex].type,
      assigneA
    };
    
    todos[todoIndex] = updatedTodo;
    
    if (writeData('todos', todos)) {
      res.status(200).json({
        success: true,
        message: 'Tâche mise à jour avec succès',
        data: updatedTodo
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la tâche',
      error: error.message
    });
  }
});

// Toggle todo status
router.put('/:id/toggle', (req, res) => {
  try {
    const todos = readData('todos');
    const todoIndex = todos.findIndex(t => t.id === req.params.id);
    
    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }
    
    // Cycle through statuses: en_attente -> en_cours -> termine -> en_attente
    const currentStatus = todos[todoIndex].statut;
    let newStatus;
    
    if (currentStatus === 'en_attente') {
      newStatus = 'en_cours';
    } else if (currentStatus === 'en_cours') {
      newStatus = 'termine';
    } else {
      newStatus = 'en_attente';
    }
    
    todos[todoIndex].statut = newStatus;
    
    if (writeData('todos', todos)) {
      res.status(200).json({
        success: true,
        message: 'Statut de la tâche mis à jour avec succès',
        data: todos[todoIndex]
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

// Delete todo
router.delete('/:id', (req, res) => {
  try {
    const todos = readData('todos');
    const todoIndex = todos.findIndex(t => t.id === req.params.id);
    
    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }
    
    todos.splice(todoIndex, 1);
    
    if (writeData('todos', todos)) {
      res.status(200).json({
        success: true,
        message: 'Tâche supprimée avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la tâche',
      error: error.message
    });
  }
});

module.exports = router;