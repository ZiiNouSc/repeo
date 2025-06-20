const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// Get financial report
router.get('/financier', protect, hasPermission('rapports', 'lire'), (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
    const { period = 'mois', year = new Date().getFullYear() } = req.query;
    
    // Calculate financial data
    const data = {
      periode: `${period} ${year}`,
      chiffreAffaires: {
        moisActuel: 45230,
        moisPrecedent: 38950,
        evolution: 16.1
      },
      benefices: {
        moisActuel: 12450,
        moisPrecedent: 10200,
        evolution: 22.1
      },
      depenses: {
        moisActuel: 32780,
        moisPrecedent: 28750,
        evolution: 14.0
      },
      creances: {
        total: 8950,
        enRetard: 3200
      },
      ventesParMois: [
        { mois: 'Jan', montant: 32000, reservations: 22 },
        { mois: 'Fév', montant: 28500, reservations: 28 },
        { mois: 'Mar', montant: 35200, reservations: 25 },
        { mois: 'Avr', montant: 41800, reservations: 32 },
        { mois: 'Mai', montant: 38950, reservations: 27 },
        { mois: 'Juin', montant: 45230, reservations: 22 }
      ],
      topClients: [
        { nom: 'Entreprise ABC', montant: 12500, pourcentage: 27.6 },
        { nom: 'Martin Dubois', montant: 8900, pourcentage: 19.7 },
        { nom: 'Sophie Martin', montant: 6750, pourcentage: 14.9 },
        { nom: 'Jean Dupont', montant: 5200, pourcentage: 11.5 },
        { nom: 'Autres', montant: 11880, pourcentage: 26.3 }
      ],
      repartitionVentes: [
        { categorie: 'Packages voyage', montant: 18500, pourcentage: 40.9 },
        { categorie: 'Billets d\'avion', montant: 12800, pourcentage: 28.3 },
        { categorie: 'Hébergement', montant: 8900, pourcentage: 19.7 },
        { categorie: 'Transport', montant: 3200, pourcentage: 7.1 },
        { categorie: 'Autres', montant: 1830, pourcentage: 4.0 }
      ]
    };
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données financières',
      error: error.message
    });
  }
});

// Get client report
router.get('/clients', protect, hasPermission('rapports', 'lire'), (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
    
    // Calculate stats
    const data = {
      totalClients: 89,
      nouveauxClients: {
        mois: 18,
        evolution: 15.3
      },
      clientsActifs: {
        nombre: 62,
        pourcentage: 70
      },
      repartition: {
        particuliers: {
          nombre: 65,
          pourcentage: 73
        },
        entreprises: {
          nombre: 24,
          pourcentage: 27
        }
      },
      topClients: [
        { id: '1', nom: 'Entreprise ABC', montant: 12500, reservations: 8 },
        { id: '2', nom: 'Martin Dubois', montant: 8900, reservations: 5 },
        { id: '3', nom: 'Sophie Martin', montant: 6750, reservations: 4 },
        { id: '4', nom: 'Jean Dupont', montant: 5200, reservations: 3 },
        { id: '5', nom: 'Marie Leroy', montant: 4800, reservations: 3 }
      ]
    };
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du rapport clients',
      error: error.message
    });
  }
});

// Get destination report
router.get('/destinations', protect, hasPermission('rapports', 'lire'), (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.user?.agenceId || '60d0fe4f5311236168a109ca'; // Default for testing
    
    // Calculate stats
    const destinations = [
      { destination: 'Rome, Italie', reservations: 23, ca: 28750 },
      { destination: 'Madrid, Espagne', reservations: 18, ca: 22400 },
      { destination: 'Londres, UK', reservations: 15, ca: 31200 },
      { destination: 'Amsterdam, Pays-Bas', reservations: 12, ca: 18600 },
      { destination: 'Barcelone, Espagne', reservations: 10, ca: 15800 }
    ];
    
    const data = {
      topDestinations: destinations,
      totalReservations: 156,
      totalCA: destinations.reduce((sum, d) => sum + d.ca, 0),
      repartitionGeographique: [
        { region: 'Europe', pourcentage: 65, montant: 75000 },
        { region: 'Amérique du Nord', pourcentage: 15, montant: 18000 },
        { region: 'Asie', pourcentage: 10, montant: 12000 },
        { region: 'Afrique', pourcentage: 7, montant: 8000 },
        { region: 'Océanie', pourcentage: 3, montant: 3500 }
      ]
    };
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du rapport destinations',
      error: error.message
    });
  }
});

// Export report
router.get('/export/:type', protect, hasPermission('rapports', 'exporter'), (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'pdf' } = req.query;
    
    // In a real app, this would generate a report file
    res.status(200).json({
      success: true,
      message: `Rapport ${type} exporté au format ${format}`,
      downloadUrl: `/api/rapports/download/${type}.${format}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export du rapport',
      error: error.message
    });
  }
});

module.exports = router;