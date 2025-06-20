const asyncHandler = require('express-async-handler');
const Agent = require('../models/agentModel');
const User = require('../models/userModel');
const Agence = require('../models/agenceModel');
const bcrypt = require('bcryptjs');

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private/Agency
const getAgents = asyncHandler(async (req, res) => {
  // Get agenceId from authenticated user
  const agenceId = req.user?.agenceId;
  
  if (!agenceId) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'agence manquant'
    });
  }
  
  const agents = await Agent.find({ agenceId });
  
  // Format response to match frontend expectations
  const formattedAgents = agents.map(agent => ({
    id: agent._id,
    nom: agent.nom,
    prenom: agent.prenom,
    email: agent.email,
    telephone: agent.telephone,
    permissions: agent.permissions,
    statut: agent.statut,
    dateCreation: agent.dateCreation
  }));
  
  res.status(200).json({
    success: true,
    data: formattedAgents
  });
});

// @desc    Get agent by ID
// @route   GET /api/agents/:id
// @access  Private/Agency
const getAgentById = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);
  
  // Vérifier que l'agent appartient à l'agence de l'utilisateur connecté
  if (agent && agent.agenceId.toString() === req.user.agenceId.toString()) {
    // Format response to match frontend expectations
    const formattedAgent = {
      id: agent._id,
      nom: agent.nom,
      prenom: agent.prenom,
      email: agent.email,
      telephone: agent.telephone,
      permissions: agent.permissions,
      statut: agent.statut,
      dateCreation: agent.dateCreation
    };
    
    res.status(200).json({
      success: true,
      data: formattedAgent
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Agent non trouvé'
    });
  }
});

// @desc    Create new agent
// @route   POST /api/agents
// @access  Private/Agency
const createAgent = asyncHandler(async (req, res) => {
  const { nom, prenom, email, telephone, permissions = [], statut = 'actif', password = 'password123' } = req.body;
  
  if (!nom || !prenom || !email) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  // Check if email already exists
  const existingAgent = await Agent.findOne({ email });
  if (existingAgent) {
    return res.status(400).json({
      success: false,
      message: 'Cet email est déjà utilisé'
    });
  }
  
  // Get agenceId from authenticated user
  const agenceId = req.user?.agenceId;
  
  if (!agenceId) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'agence manquant'
    });
  }
  
  // Vérifier que l'agence existe
  const agence = await Agence.findById(agenceId);
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
  
  // Vérifier que les modules demandés sont bien actifs pour l'agence
  if (permissions && permissions.length > 0) {
    for (const perm of permissions) {
      if (!agence.modulesActifs.includes(perm.module)) {
        return res.status(400).json({
          success: false,
          message: `Le module "${perm.module}" n'est pas actif pour votre agence`
        });
      }
    }
  }
  
  const agent = await Agent.create({
    nom,
    prenom,
    email,
    telephone: telephone || '',
    permissions,
    statut,
    agenceId
  });
  
  // Create user account for agent
  const user = await User.create({
    email,
    password, // Will be hashed by the pre-save hook
    nom,
    prenom,
    role: 'agent',
    agenceId,
    agences: [agenceId], // Ajouter l'agence à la liste des agences de l'agent
    statut,
    permissions
  });
  
  // Format response to match frontend expectations
  const formattedAgent = {
    id: agent._id,
    nom: agent.nom,
    prenom: agent.prenom,
    email: agent.email,
    telephone: agent.telephone,
    permissions: agent.permissions,
    statut: agent.statut,
    dateCreation: agent.dateCreation
  };
  
  res.status(201).json({
    success: true,
    message: 'Agent créé avec succès',
    data: formattedAgent
  });
});

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private/Agency
const updateAgent = asyncHandler(async (req, res) => {
  const { nom, prenom, email, telephone, statut } = req.body;
  
  if (!nom || !prenom || !email) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const agent = await Agent.findById(req.params.id);
  
  // Vérifier que l'agent appartient à l'agence de l'utilisateur connecté
  if (agent && agent.agenceId.toString() === req.user.agenceId.toString()) {
    // Check if email already exists (except for this agent)
    if (email !== agent.email) {
      const existingAgent = await Agent.findOne({ email });
      if (existingAgent) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
    }
    
    agent.nom = nom;
    agent.prenom = prenom;
    agent.email = email;
    agent.telephone = telephone || '';
    agent.statut = statut || agent.statut;
    
    const updatedAgent = await agent.save();
    
    // Update user account
    const user = await User.findOne({ email: agent.email });
    if (user) {
      user.nom = nom;
      user.prenom = prenom;
      user.email = email;
      user.statut = statut || user.statut;
      await user.save();
    }
    
    // Format response to match frontend expectations
    const formattedAgent = {
      id: updatedAgent._id,
      nom: updatedAgent.nom,
      prenom: updatedAgent.prenom,
      email: updatedAgent.email,
      telephone: updatedAgent.telephone,
      permissions: updatedAgent.permissions,
      statut: updatedAgent.statut,
      dateCreation: updatedAgent.dateCreation
    };
    
    res.status(200).json({
      success: true,
      message: 'Agent mis à jour avec succès',
      data: formattedAgent
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Agent non trouvé'
    });
  }
});

// @desc    Update agent permissions
// @route   PUT /api/agents/:id/permissions
// @access  Private/Agency
const updateAgentPermissions = asyncHandler(async (req, res) => {
  const { permissions } = req.body;
  
  if (!permissions || !Array.isArray(permissions)) {
    return res.status(400).json({
      success: false,
      message: 'Permissions manquantes ou invalides'
    });
  }
  
  const agent = await Agent.findById(req.params.id);
  
  // Vérifier que l'agent appartient à l'agence de l'utilisateur connecté
  if (agent && agent.agenceId.toString() === req.user.agenceId.toString()) {
    // Vérifier que l'agence existe
    const agence = await Agence.findById(req.user.agenceId);
    if (!agence) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    // Vérifier que les modules demandés sont bien actifs pour l'agence
    for (const perm of permissions) {
      if (!agence.modulesActifs.includes(perm.module)) {
        return res.status(400).json({
          success: false,
          message: `Le module "${perm.module}" n'est pas actif pour votre agence`
        });
      }
    }
    
    agent.permissions = permissions;
    const updatedAgent = await agent.save();
    
    // Update user permissions
    const user = await User.findOne({ email: agent.email });
    if (user) {
      user.permissions = permissions;
      await user.save();
    }
    
    // Format response to match frontend expectations
    const formattedAgent = {
      id: updatedAgent._id,
      nom: updatedAgent.nom,
      prenom: updatedAgent.prenom,
      email: updatedAgent.email,
      telephone: updatedAgent.telephone,
      permissions: updatedAgent.permissions,
      statut: updatedAgent.statut,
      dateCreation: updatedAgent.dateCreation
    };
    
    res.status(200).json({
      success: true,
      message: 'Permissions mises à jour avec succès',
      data: formattedAgent
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Agent non trouvé'
    });
  }
});

// @desc    Assign agent to agencies
// @route   PUT /api/agents/:id/agencies
// @access  Private/Agency
const assignAgentToAgencies = asyncHandler(async (req, res) => {
  const { agences } = req.body;
  
  if (!agences || !Array.isArray(agences)) {
    return res.status(400).json({
      success: false,
      message: 'Liste d\'agences manquante ou invalide'
    });
  }
  
  const agent = await Agent.findById(req.params.id);
  
  // Vérifier que l'agent appartient à l'agence de l'utilisateur connecté
  if (agent && agent.agenceId.toString() === req.user.agenceId.toString()) {
    // Mettre à jour l'utilisateur associé
    const user = await User.findOne({ email: agent.email });
    if (user) {
      user.agences = agences;
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Agences attribuées avec succès',
        data: {
          id: agent._id,
          agences: agences
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Utilisateur associé non trouvé'
      });
    }
  } else {
    res.status(404).json({
      success: false,
      message: 'Agent non trouvé'
    });
  }
});

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private/Agency
const deleteAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);
  
  // Vérifier que l'agent appartient à l'agence de l'utilisateur connecté
  if (agent && agent.agenceId.toString() === req.user.agenceId.toString()) {
    // Delete agent
    await Agent.deleteOne({ _id: agent._id });
    
    // Remove user account
    await User.deleteOne({ email: agent.email });
    
    res.status(200).json({
      success: true,
      message: 'Agent supprimé avec succès'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Agent non trouvé'
    });
  }
});

module.exports = {
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  updateAgentPermissions,
  assignAgentToAgencies,
  deleteAgent
};