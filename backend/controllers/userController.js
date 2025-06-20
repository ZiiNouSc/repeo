const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Agence = require('../models/agenceModel');
const generateToken = require('../utils/generateToken');
const mongoose = require('mongoose');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe requis'
    });
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Pour les agents, récupérer les agences associées
    let userAgences = [];
    if (user.role === 'agent') {
      if (user.agences && user.agences.length > 0) {
        userAgences = await Agence.find({ _id: { $in: user.agences } });
      } else if (user.agenceId) {
        const agence = await Agence.findById(user.agenceId);
        if (agence) {
          userAgences = [agence];
        }
      }
    } else if (user.role === 'agence' && user.agenceId) {
      const agence = await Agence.findById(user.agenceId);
      if (agence) {
        userAgences = [agence];
      }
    }

    // Remove password from response
    const userWithoutPassword = {
      id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      agenceId: user.agenceId,
      agences: userAgences.map(a => ({
        id: a._id,
        nom: a.nom,
        email: a.email,
        statut: a.statut,
        modulesActifs: a.modulesActifs
      })),
      statut: user.statut,
      permissions: user.permissions
    };

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      user: userWithoutPassword,
      token: generateToken(user._id)
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Identifiants incorrects'
    });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
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

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'Cet email est déjà utilisé'
    });
  }

  // Create new agency
  const agence = await Agence.create({
    nom: nomAgence,
    email,
    telephone,
    adresse: `${adresse}, ${codePostal} ${ville}, ${pays}`,
    statut: 'en_attente',
    modulesActifs: [],
    modulesDemandes: modulesChoisis,
    modulesChoisis,
    typeActivite,
    siret
  });

  // Create new user
  const user = await User.create({
    email,
    password,
    nom: nomAgence,
    prenom: '',
    role: 'agence',
    statut: 'en_attente',
    agenceId: agence._id
  });

  if (user) {
    // Remove password from response
    const userWithoutPassword = {
      id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      agenceId: user.agenceId,
      statut: user.statut
    };

    res.status(201).json({
      success: true,
      message: 'Inscription réussie, en attente d\'approbation',
      user: userWithoutPassword
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Données utilisateur invalides'
    });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.status(200).json({
      success: true,
      data: user
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé'
    });
  }
});

// @desc    Get user's agencies
// @route   GET /api/user/agences
// @access  Private/Agent
const getUserAgences = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Si l'utilisateur est un agent, récupérer ses agences
  if (req.user.role === 'agent') {
    let agences = [];
    
    if (req.user.agences && req.user.agences.length > 0) {
      agences = await Agence.find({ _id: { $in: req.user.agences } });
    } else if (req.user.agenceId) {
      const agence = await Agence.findById(req.user.agenceId);
      if (agence) {
        agences = [agence];
      }
    }

    res.status(200).json({
      success: true,
      data: agences
    });
  } else if (req.user.role === 'agence' && req.user.agenceId) {
    // Si l'utilisateur est une agence, renvoyer son agence
    const agence = await Agence.findById(req.user.agenceId);
    
    if (agence) {
      res.status(200).json({
        success: true,
        data: [agence]
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
  } else {
    res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }
});

module.exports = {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  getUserAgences
};