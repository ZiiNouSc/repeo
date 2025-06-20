const asyncHandler = require('express-async-handler');
const Agent = require('../models/agentModel');
const User = require('../models/userModel');

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private/Agency
const getAgents = asyncHandler(async (req, res) => {
  // In a real app, filter by agency ID from authenticated user
  const agents = await Agent.find({});
  
  res.status(200).json({
    success: true,
    data: agents
  });
});

// @desc    Get agent by ID
// @route   GET /api/agents/:id
// @access  Private/Agency
const getAgentById = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);
  
  if (agent) {
    res.status(200).json({
      success: true,
      data: agent
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
  const { nom, prenom, email, telephone, permissions = [], statut = 'actif', agenceId } = req.body;
  
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
    password: 'password123', // In a real app, this would be hashed and a random password would be generated
    nom,
    prenom,
    role: 'agent',
    agenceId,
    statut,
    permissions
  });
  
  res.status(201).json({
    success: true,
    message: 'Agent créé avec succès',
    data: agent
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
  
  if (agent) {
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
    
    res.status(200).json({
      success: true,
      message: 'Agent mis à jour avec succès',
      data: updatedAgent
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
  
  if (agent) {
    agent.permissions = permissions;
    const updatedAgent = await agent.save();
    
    // Update user permissions
    const user = await User.findOne({ email: agent.email });
    if (user) {
      user.permissions = permissions;
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Permissions mises à jour avec succès',
      data: updatedAgent
    });
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
  
  if (agent) {
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
  deleteAgent
};