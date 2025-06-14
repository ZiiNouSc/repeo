const express = require('express');
const router = express.Router();
const { readData } = require('../utils/dataHelper');

// Get financial report
router.get('/financier', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    const { period = 'mois', year = new Date().getFullYear() } = req.query;
    
    // Get data from various sources
    const factures = readData('factures');
    const operations = readData('operations');
    const clients = readData('clients');
    const reservations = readData('reservations');
    
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
        total: factures
          .filter(f => f.statut === 'envoyee' || f.statut === 'en_retard')
          .reduce((sum, f) => sum + f.montantTTC, 0),
        enRetard: factures
          .filter(f => f.statut === 'en_retard')
          .reduce((sum, f) => sum + f.montantTTC, 0)
      },
      ventesParMois: [
        { mois: 'Jan', montant: 32000, reservations: 22 },
        { mois: 'Fév', montant: 28500, reservations: 28 },
        { mois: 'Mar', montant: 35200, reservations: 25 },
        { mois: 'Avr', montant: 41800, reservations: 32 },
        { mois: 'Mai', montant: 38950, reservations: 27 },
        { mois: 'Juin', montant: 45230, reservations: 22 }
      ],
      topClients: clients
        .slice(0, 4)
        .map(client => ({
          nom: client.entreprise || `${client.prenom} ${client.nom}`,
          montant: Math.floor(Math.random() * 10000) + 5000,
          pourcentage: Math.floor(Math.random() * 20) + 10
        }))
        .concat([
          { nom: 'Autres', montant: 11880, pourcentage: 26.3 }
        ]),
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
router.get('/clients', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    // Get data
    const clients = readData('clients');
    
    // Calculate stats
    const data = {
      totalClients: clients.length,
      nouveauxClients: {
        mois: Math.floor(clients.length * 0.2),
        evolution: 15.3
      },
      clientsActifs: {
        nombre: Math.floor(clients.length * 0.7),
        pourcentage: 70
      },
      repartition: {
        particuliers: {
          nombre: clients.filter(c => !c.entreprise).length,
          pourcentage: Math.round(clients.filter(c => !c.entreprise).length / clients.length * 100)
        },
        entreprises: {
          nombre: clients.filter(c => c.entreprise).length,
          pourcentage: Math.round(clients.filter(c => c.entreprise).length / clients.length * 100)
        }
      },
      topClients: clients
        .slice(0, 5)
        .map(client => ({
          id: client.id,
          nom: client.entreprise || `${client.prenom} ${client.nom}`,
          montant: Math.floor(Math.random() * 10000) + 2000,
          reservations: Math.floor(Math.random() * 10) + 1
        }))
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
router.get('/destinations', (req, res) => {
  try {
    // In a real app, you would get the agenceId from the authenticated user
    const agenceId = req.headers['x-agence-id'] || '1'; // Default for testing
    
    // Get data
    const reservations = readData('reservations');
    
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
      totalReservations: reservations.length,
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
router.get('/export/:type', (req, res) => {
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