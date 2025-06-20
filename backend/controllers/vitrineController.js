const asyncHandler = require('express-async-handler');
const Agence = require('../models/agenceModel');

// @desc    Get vitrine config
// @route   GET /api/vitrine
// @access  Private/Agency
const getVitrineConfig = asyncHandler(async (req, res) => {
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const agence = await Agence.findById(agenceId);
  
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
  
  // Get or create vitrine config
  if (!agence.vitrineConfig) {
    agence.vitrineConfig = {
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
    
    await agence.save();
  }
  
  res.status(200).json({
    success: true,
    data: agence.vitrineConfig
  });
});

// @desc    Update vitrine config
// @route   PUT /api/vitrine
// @access  Private/Agency
const updateVitrineConfig = asyncHandler(async (req, res) => {
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const agence = await Agence.findById(agenceId);
  
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
  
  // Update vitrine config
  agence.vitrineConfig = req.body;
  await agence.save();
  
  res.status(200).json({
    success: true,
    message: 'Configuration de la vitrine mise à jour avec succès',
    data: agence.vitrineConfig
  });
});

// @desc    Toggle vitrine active status
// @route   PUT /api/vitrine/toggle
// @access  Private/Agency
const toggleVitrineActive = asyncHandler(async (req, res) => {
  // In a real app, get agenceId from authenticated user
  const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
  
  const agence = await Agence.findById(agenceId);
  
  if (!agence) {
    return res.status(404).json({
      success: false,
      message: 'Agence non trouvée'
    });
  }
  
  // Create vitrine config if it doesn't exist
  if (!agence.vitrineConfig) {
    agence.vitrineConfig = {
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
  }
  
  // Toggle isActive
  agence.vitrineConfig.isActive = !agence.vitrineConfig.isActive;
  await agence.save();
  
  res.status(200).json({
    success: true,
    message: `Vitrine ${agence.vitrineConfig.isActive ? 'activée' : 'désactivée'} avec succès`,
    data: { isActive: agence.vitrineConfig.isActive }
  });
});

module.exports = {
  getVitrineConfig,
  updateVitrineConfig,
  toggleVitrineActive
};