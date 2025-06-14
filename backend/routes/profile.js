const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/dataHelper');

// Get profile
router.get('/', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    const agences = readData('agences');
    const agence = agences.find(a => a.id === agenceId);
    
    if (!agence) {
      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé'
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
});

// Update profile
router.put('/', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    const agences = readData('agences');
    const agenceIndex = agences.findIndex(a => a.id === agenceId);
    
    if (agenceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé'
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
    agences[agenceIndex] = {
      ...agences[agenceIndex],
      nom: nomAgence || agences[agenceIndex].nom,
      typeActivite: typeActivite || agences[agenceIndex].typeActivite,
      siret: siret || agences[agenceIndex].siret,
      adresse: `${adresse}, ${codePostal} ${ville}, ${pays}`,
      telephone: telephone || agences[agenceIndex].telephone,
      email: email || agences[agenceIndex].email,
      siteWeb,
      raisonSociale,
      numeroTVA,
      numeroLicence,
      garantieFinanciere,
      assuranceRC,
      banque,
      rib,
      swift
    };
    
    if (writeData('agences', agences)) {
      // Also update user data if email changed
      if (email && email !== agences[agenceIndex].email) {
        const users = readData('users');
        const userIndex = users.findIndex(u => u.agenceId === agenceId);
        
        if (userIndex !== -1) {
          users[userIndex].email = email;
          writeData('users', users);
        }
      }
      
      res.status(200).json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: agences[agenceIndex]
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
});

// Update logo
router.post('/logo', (req, res) => {
  try {
    // In a real app, you would handle file upload
    // For now, we'll just update the logo URL
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    const agences = readData('agences');
    const agenceIndex = agences.findIndex(a => a.id === agenceId);
    
    if (agenceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé'
      });
    }
    
    // Simulate a new logo URL
    const logoUrl = `/api/placeholder/150/150?v=${Date.now()}`;
    
    agences[agenceIndex].logoUrl = logoUrl;
    
    if (writeData('agences', agences)) {
      res.status(200).json({
        success: true,
        message: 'Logo mis à jour avec succès',
        data: { logoUrl }
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du logo',
      error: error.message
    });
  }
});

module.exports = router;