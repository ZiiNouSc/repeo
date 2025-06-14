const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/dataHelper');

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe requis'
    });
  }
  
  const users = readData('users');
  const user = users.find(u => u.email === email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Identifiants incorrects'
    });
  }
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  
  // In a real app, you would generate a JWT token here
  return res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    user: userWithoutPassword,
    token: 'fake-jwt-token-' + Math.random().toString(36).substring(2)
  });
});

// Register route
router.post('/register', (req, res) => {
  const { 
    nomAgence, 
    email, 
    password, 
    typeActivite, 
    siret, 
    adresse, 
    ville, 
    codePostal, 
    pays, 
    telephone,
    modulesChoisis = []
  } = req.body;
  
  if (!nomAgence || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const users = readData('users');
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'Cet email est déjà utilisé'
    });
  }
  
  const agenceId = uuidv4();
  
  // Create new user
  const newUser = {
    id: uuidv4(),
    email,
    password, // In a real app, this would be hashed
    nom: nomAgence,
    prenom: '',
    role: 'agence',
    statut: 'en_attente',
    agenceId,
    dateInscription: new Date().toISOString()
  };
  
  users.push(newUser);
  
  if (writeData('users', users)) {
    // Create new agency
    const agences = readData('agences');
    const newAgence = {
      id: agenceId,
      nom: nomAgence,
      email,
      telephone,
      adresse: `${adresse}, ${codePostal} ${ville}, ${pays}`,
      statut: 'en_attente',
      dateInscription: new Date().toISOString(),
      modulesActifs: [],
      modulesChoisis,
      typeActivite,
      siret
    };
    
    agences.push(newAgence);
    writeData('agences', agences);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({
      success: true,
      message: 'Inscription réussie, en attente d\'approbation',
      user: userWithoutPassword
    });
  } else {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription'
    });
  }
});

// Logout route (for completeness, though frontend handles this)
router.post('/logout', (req, res) => {
  // In a real app with JWT, you might blacklist the token
  return res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// Get current user route
router.get('/me', (req, res) => {
  // In a real app, you would verify the JWT token and return the user
  // For now, we'll just return a mock response
  return res.status(200).json({
    success: false,
    message: 'Authentification requise'
  });
});

module.exports = router;