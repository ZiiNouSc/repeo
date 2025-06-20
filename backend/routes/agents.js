const express = require('express');
const router = express.Router();
const { 
  getAgents, 
  getAgentById, 
  createAgent, 
  updateAgent, 
  updateAgentPermissions,
  assignAgentToAgencies,
  deleteAgent 
} = require('../controllers/agentController');
const { protect, agency } = require('../middlewares/authMiddleware');

// Get all agents
router.get('/', protect, agency, getAgents);

// Get agent by ID
router.get('/:id', protect, agency, getAgentById);

// Create new agent
router.post('/', protect, agency, createAgent);

// Update agent
router.put('/:id', protect, agency, updateAgent);

// Update agent permissions
router.put('/:id/permissions', protect, agency, updateAgentPermissions);

// Assign agent to agencies
router.put('/:id/agencies', protect, agency, assignAgentToAgencies);

// Delete agent
router.delete('/:id', protect, agency, deleteAgent);

module.exports = router;