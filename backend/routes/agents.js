const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all agents
router.get('/', (req, res) => {
  try {
    const agents = readData('agents');
    res.status(200).json({
      success: true,
      data: agents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des agents',
      error: error.message
    });
  }
});

// Get agent by ID
router.get('/:id', (req, res) => {
  try {
    const agents = readData('agents');
    const agent = agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'agent',
      error: error.message
    });
  }
});

// Create new agent
router.post('/', (req, res) => {
  try {
    const { nom, prenom, email, telephone, permissions = [], statut = 'actif' } = req.body;
    
    if (!nom || !prenom || !email) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const agents = readData('agents');
    
    // Check if email already exists
    if (agents.some(a => a.email === email)) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    const newAgent = {
      id: generateId(),
      nom,
      prenom,
      email,
      telephone: telephone || '',
      permissions,
      statut,
      dateCreation: formatDate(new Date())
    };
    
    agents.push(newAgent);
    
    if (writeData('agents', agents)) {
      // Create user account for agent
      const users = readData('users');
      const newUser = {
        id: generateId(),
        email,
        password: 'password123', // In a real app, this would be hashed and a random password would be generated
        nom,
        prenom,
        role: 'agent',
        agenceId: req.body.agenceId, // This should be provided by the authenticated agence
        statut,
        permissions
      };
      
      users.push(newUser);
      writeData('users', users);
      
      res.status(201).json({
        success: true,
        message: 'Agent créé avec succès',
        data: newAgent
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'agent',
      error: error.message
    });
  }
});

// Update agent
router.put('/:id', (req, res) => {
  try {
    const { nom, prenom, email, telephone, statut } = req.body;
    
    if (!nom || !prenom || !email) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const agents = readData('agents');
    const agentIndex = agents.findIndex(a => a.id === req.params.id);
    
    if (agentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agent non trouvé'
      });
    }
    
    // Check if email already exists (except for this agent)
    if (agents.some(a => a.email === email && a.id !== req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    const updatedAgent = {
      ...agents[agentIndex],
      nom,
      prenom,
      email,
      telephone: telephone || '',
      statut: statut || agents[agentIndex].statut
    };
    
    agents[agentIndex] = updatedAgent;
    
    if (writeData('agents', agents)) {
      // Update user account
      const users = readData('users');
      const userIndex = users.findIndex(u => u.email === agents[agentIndex].email);
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          nom,
          prenom,
          email,
          statut: statut || users[userIndex].statut
        };
        
        writeData('users', users);
      }
      
      res.status(200).json({
        success: true,
        message: 'Agent mis à jour avec succès',
        data: updatedAgent
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'agent',
      error: error.message
    });
  }
});

// Update agent permissions
router.put('/:id/permissions', (req, res) => {
  try {
    const { permissions } = req.body;
    
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions manquantes ou invalides'
      });
    }
    
    const agents = readData('agents');
    const agentIndex = agents.findIndex(a => a.id === req.params.id);
    
    if (agentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agent non trouvé'
      });
    }
    
    agents[agentIndex].permissions = permissions;
    
    if (writeData('agents', agents)) {
      // Update user permissions
      const users = readData('users');
      const userIndex = users.findIndex(u => u.email === agents[agentIndex].email);
      
      if (userIndex !== -1) {
        users[userIndex].permissions = permissions;
        writeData('users', users);
      }
      
      res.status(200).json({
        success: true,
        message: 'Permissions mises à jour avec succès',
        data: agents[agentIndex]
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des permissions',
      error: error.message
    });
  }
});

// Delete agent
router.delete('/:id', (req, res) => {
  try {
    const agents = readData('agents');
    const agentIndex = agents.findIndex(a => a.id === req.params.id);
    
    if (agentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agent non trouvé'
      });
    }
    
    const agentEmail = agents[agentIndex].email;
    agents.splice(agentIndex, 1);
    
    if (writeData('agents', agents)) {
      // Remove user account
      const users = readData('users');
      const userIndex = users.findIndex(u => u.email === agentEmail);
      
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
        writeData('users', users);
      }
      
      res.status(200).json({
        success: true,
        message: 'Agent supprimé avec succès'
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'agent',
      error: error.message
    });
  }
});

module.exports = router;