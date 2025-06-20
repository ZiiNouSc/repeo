const asyncHandler = require('express-async-handler');
const Agence = require('../models/agenceModel');
const User = require('../models/userModel');

// @desc    Get profile
// @route   GET /api/profile
// @access  Private/Agency
const getProfile = asyncHandler(async (req, res) => {
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId;
  
  if (!agenceId) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'agence manquant'
    });
  }
  
  const agence = await Agence.findById(agenceId);
  
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
  
  // Create profile data from agence
  const profileData = {
    nomAgence: agence.nom,
    typeActivite: agence.typeActivite || 'agence-voyage',
    siret: agence.siret || '12345678901234',
    logo: agence.logo || null,
    logoUrl: agence.logoUrl || '/api/placeholder/150/150',
    adresse: agence.adresse.split(',')[0].trim(),
    ville: (agence.adresse.split(',')[1] || '').trim().split(' ')[1] || 'Paris',
    codePostal: (agence.adresse.split(',')[1] || '').trim().split(' ')[0] || '75001',
    pays: (agence.adresse.split(',')[2] || '').trim() || 'France',
    telephone: agence.telephone,
    email: agence.email,
    siteWeb: agence.siteWeb || 'https://www.voyages-express.com',
    raisonSociale: agence.raisonSociale || `${agence.nom} SARL`,
    numeroTVA: agence.numeroTVA || 'FR12345678901',
    numeroLicence: agence.numeroLicence || 'IM075110001',
    garantieFinanciere: agence.garantieFinanciere || 'APST - 15 Avenue Carnot, 75017 Paris',
    assuranceRC: agence.assuranceRC || 'AXA Assurances - Police n° 123456789',
    banque: agence.banque || 'Crédit Agricole',
    rib: agence.rib || 'FR76 1234 5678 9012 3456 7890 123',
    swift: agence.swift || 'AGRIFRPP'
  };
  
  res.status(200).json({
    success: true,
    data: profileData
  });
});

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private/Agency
const updateProfile = asyncHandler(async (req, res) => {
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId;
  
  if (!agenceId) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'agence manquant'
    });
  }
  
  const agence = await Agence.findById(agenceId);
  
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
  
  const {
    nomAgence,
    typeActivite,
    siret,
    adresse,
    ville,
    codePostal,
    pays,
    telephone,
    email,
    siteWeb,
    raisonSociale,
    numeroTVA,
    numeroLicence,
    garantieFinanciere,
    assuranceRC,
    banque,
    rib,
    swift
  } = req.body;
  
  // Update agence data
  agence.nom = nomAgence || agence.nom;
  agence.typeActivite = typeActivite || agence.typeActivite;
  agence.siret = siret || agence.siret;
  agence.adresse = `${adresse}, ${codePostal} ${ville}, ${pays}`;
  agence.telephone = telephone || agence.telephone;
  agence.email = email || agence.email;
  agence.siteWeb = siteWeb;
  agence.raisonSociale = raisonSociale;
  agence.numeroTVA = numeroTVA;
  agence.numeroLicence = numeroLicence;
  agence.garantieFinanciere = garantieFinanciere;
  agence.assuranceRC = assuranceRC;
  agence.banque = banque;
  agence.rib = rib;
  agence.swift = swift;
  
  await agence.save();
  
  // Also update user data if email changed
  if (email && email !== agence.email) {
    const user = await User.findOne({ agenceId });
    
    if (user) {
      user.email = email;
      await user.save();
    }
  }
  
  res.status(200).json({
    success: true,
    message: 'Profil mis à jour avec succès',
    data: agence
  });
});

// @desc    Update logo
// @route   POST /api/profile/logo
// @access  Private/Agency
const updateLogo = asyncHandler(async (req, res) => {
  // In a real app, handle file upload
  // For now, we'll just update the logo URL
  const agenceId = req.user?.agenceId;
  
  if (!agenceId) {
    return res.status(400).json({
      success: false,
      message: 'ID d\'agence manquant'
    });
  }
  
  const agence = await Agence.findById(agenceId);
  
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Profil non trouvé'
    });
  }
  
  // Simulate a new logo URL
  const logoUrl = `/api/placeholder/150/150?v=${Date.now()}`;
  
  agence.logoUrl = logoUrl;
  await agence.save();
  
  res.status(200).json({
    success: true,
    message: 'Logo mis à jour avec succès',
    data: { logoUrl }
  });
});

module.exports = {
  getProfile,
  updateProfile,
  updateLogo
};