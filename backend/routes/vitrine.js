const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/dataHelper');

// Get vitrine config
router.get('/', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    const agences = readData('agences');
    const agence = agences.find(a => a.id === agenceId);
    
    if (!agence) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    // Get or create vitrine config
    const vitrineConfig = agence.vitrineConfig || {
      isActive: true,
      domainName: `${agence.nom.toLowerCase().replace(/\s+/g, '-')}.samtech.fr`,
      title: `${agence.nom} - Votre Agence de Voyage`,
      description: `Découvrez nos offres de voyage exceptionnelles et partez à la découverte du monde avec ${agence.nom}.`,
      logo: '/api/placeholder/200/80',
      bannerImage: '/api/placeholder/1200/400',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      showPackages: true,
      showContact: true,
      showAbout: true,
      contactInfo: {
        phone: agence.telephone,
        email: agence.email,
        address: agence.adresse,
        hours: 'Lun-Ven: 9h-18h, Sam: 9h-12h'
      },
      aboutText: `${agence.nom} est votre partenaire de confiance pour tous vos projets de voyage. Avec plus de 15 ans d'expérience, nous vous accompagnons dans la réalisation de vos rêves d'évasion.`,
      socialLinks: {
        facebook: `https://facebook.com/${agence.nom.toLowerCase().replace(/\s+/g, '-')}`,
        instagram: `https://instagram.com/${agence.nom.toLowerCase().replace(/\s+/g, '-')}`,
        twitter: `https://twitter.com/${agence.nom.toLowerCase().replace(/\s+/g, '-')}`
      }
    };
    
    res.status(200).json({
      success: true,
      data: vitrineConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la configuration de la vitrine',
      error: error.message
    });
  }
});

// Update vitrine config
router.put('/', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    const agences = readData('agences');
    const agenceIndex = agences.findIndex(a => a.id === agenceId);
    
    if (agenceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    // Update vitrine config
    agences[agenceIndex].vitrineConfig = req.body;
    
    if (writeData('agences', agences)) {
      res.status(200).json({
        success: true,
        message: 'Configuration de la vitrine mise à jour avec succès',
        data: req.body
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la configuration de la vitrine',
      error: error.message
    });
  }
});

// Toggle vitrine active status
router.put('/toggle', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    const agences = readData('agences');
    const agenceIndex = agences.findIndex(a => a.id === agenceId);
    
    if (agenceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }
    
    // Create vitrine config if it doesn't exist
    if (!agences[agenceIndex].vitrineConfig) {
      agences[agenceIndex].vitrineConfig = {
        isActive: true,
        domainName: `${agences[agenceIndex].nom.toLowerCase().replace(/\s+/g, '-')}.samtech.fr`,
        title: `${agences[agenceIndex].nom} - Votre Agence de Voyage`,
        description: `Découvrez nos offres de voyage exceptionnelles et partez à la découverte du monde avec ${agences[agenceIndex].nom}.`,
        logo: '/api/placeholder/200/80',
        bannerImage: '/api/placeholder/1200/400',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        showPackages: true,
        showContact: true,
        showAbout: true,
        contactInfo: {
          phone: agences[agenceIndex].telephone,
          email: agences[agenceIndex].email,
          address: agences[agenceIndex].adresse,
          hours: 'Lun-Ven: 9h-18h, Sam: 9h-12h'
        },
        aboutText: `${agences[agenceIndex].nom} est votre partenaire de confiance pour tous vos projets de voyage. Avec plus de 15 ans d'expérience, nous vous accompagnons dans la réalisation de vos rêves d'évasion.`,
        socialLinks: {
          facebook: `https://facebook.com/${agences[agenceIndex].nom.toLowerCase().replace(/\s+/g, '-')}`,
          instagram: `https://instagram.com/${agences[agenceIndex].nom.toLowerCase().replace(/\s+/g, '-')}`,
          twitter: `https://twitter.com/${agences[agenceIndex].nom.toLowerCase().replace(/\s+/g, '-')}`
        }
      };
    }
    
    // Toggle isActive
    agences[agenceIndex].vitrineConfig.isActive = !agences[agenceIndex].vitrineConfig.isActive;
    
    if (writeData('agences', agences)) {
      res.status(200).json({
        success: true,
        message: `Vitrine ${agences[agenceIndex].vitrineConfig.isActive ? 'activée' : 'désactivée'} avec succès`,
        data: { isActive: agences[agenceIndex].vitrineConfig.isActive }
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut de la vitrine',
      error: error.message
    });
  }
});

module.exports = router;