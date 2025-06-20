const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Agence = require('../models/agenceModel');
const generateToken = require('../utils/generateToken');

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
    // Remove password from response
    const userWithoutPassword = {
      id: user._id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      agenceId: user.agenceId,
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

module.exports = {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile
};