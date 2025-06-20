const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');
const User = require('./models/userModel');
const Agence = require('./models/agenceModel');
const Client = require('./models/clientModel');
const Facture = require('./models/factureModel');
const BonCommande = require('./models/bonCommandeModel');
const Operation = require('./models/operationModel');
const Package = require('./models/packageModel');
const Billet = require('./models/billetModel');
const Fournisseur = require('./models/fournisseurModel');
const Document = require('./models/documentModel');
const Reservation = require('./models/reservationModel');
const Todo = require('./models/todoModel');
const Ticket = require('./models/ticketModel');
const Agent = require('./models/agentModel');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Import sample data
const importData = async () => {
  try {
    // Clear all collections
    await User.deleteMany();
    await Agence.deleteMany();
    await Client.deleteMany();
    await Facture.deleteMany();
    await BonCommande.deleteMany();
    await Operation.deleteMany();
    await Package.deleteMany();
    await Billet.deleteMany();
    await Fournisseur.deleteMany();
    await Document.deleteMany();
    await Reservation.deleteMany();
    await Todo.deleteMany();
    await Ticket.deleteMany();
    await Agent.deleteMany();

    console.log('Data cleared...'.red.inverse);

    // Create superadmin
    const superadmin = await User.create({
      email: 'superadmin@samtech.com',
      password: 'demo123',
      nom: 'Admin',
      prenom: 'Super',
      role: 'superadmin',
      statut: 'actif'
    });

    console.log('Superadmin created...'.green);

    // Create agencies
    const agence1 = await Agence.create({
      nom: 'Voyages Express',
      email: 'contact@voyages-express.com',
      telephone: '+33 1 23 45 67 89',
      adresse: '123 Rue de la Paix, 75001 Paris',
      statut: 'en_attente',
      dateInscription: new Date('2024-01-15'),
      modulesActifs: [],
      vitrineConfig: {
        isActive: true,
        domainName: 'voyages-express.samtech.fr',
        title: 'Voyages Express - Votre Agence de Voyage',
        description: 'Découvrez nos offres de voyage exceptionnelles et partez à la découverte du monde avec Voyages Express.',
        logo: '/api/placeholder/200/80',
        bannerImage: '/api/placeholder/1200/400',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        showPackages: true,
        showContact: true,
        showAbout: true,
        contactInfo: {
          phone: '+33 1 23 45 67 89',
          email: 'contact@voyages-express.com',
          address: '123 Rue de la Paix, 75001 Paris',
          hours: 'Lun-Ven: 9h-18h, Sam: 9h-12h'
        },
        aboutText: 'Voyages Express est votre partenaire de confiance pour tous vos projets de voyage. Avec plus de 15 ans d\'expérience, nous vous accompagnons dans la réalisation de vos rêves d\'évasion.',
        socialLinks: {
          facebook: 'https://facebook.com/voyages-express',
          instagram: 'https://instagram.com/voyages-express',
          twitter: 'https://twitter.com/voyages-express'
        }
      },
      parametres: {
        apiKey: 'sk_live_x3qc8apamrj'
      }
    });

    const agence2 = await Agence.create({
      nom: 'Tourisme International',
      email: 'info@tourisme-intl.com',
      telephone: '+33 1 98 76 54 32',
      adresse: '456 Avenue des Voyages, 69002 Lyon',
      statut: 'approuve',
      dateInscription: new Date('2024-01-10'),
      modulesActifs: ['clients', 'factures', 'packages', 'billets']
    });

    const agence3 = await Agence.create({
      nom: 'Évasion Vacances',
      email: 'hello@evasion-vacances.fr',
      telephone: '+33 4 56 78 90 12',
      adresse: '789 Boulevard du Soleil, 13001 Marseille',
      statut: 'suspendu',
      dateInscription: new Date('2024-01-05'),
      modulesActifs: ['clients', 'factures']
    });

    console.log('Agencies created...'.green);

    // Create agency users
    const agenceUser1 = await User.create({
      email: 'agence@test.com',
      password: 'demo123',
      nom: 'Test',
      prenom: 'Agence',
      role: 'agence',
      agenceId: agence2._id,
      statut: 'actif'
    });

    console.log('Agency users created...'.green);

    // Create agents
    const agent1 = await Agent.create({
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@agence.com',
      telephone: '+33 1 23 45 67 89',
      permissions: [
        {
          module: 'clients',
          actions: ['lire', 'creer', 'modifier']
        },
        {
          module: 'factures',
          actions: ['lire', 'creer']
        },
        {
          module: 'packages',
          actions: ['lire']
        }
      ],
      statut: 'actif',
      dateCreation: new Date('2024-01-10'),
      agenceId: agence2._id
    });

    const agent2 = await Agent.create({
      nom: 'Dubois',
      prenom: 'Jean',
      email: 'jean.dubois@agence.com',
      telephone: '+33 1 98 76 54 32',
      permissions: [
        {
          module: 'clients',
          actions: ['lire']
        },
        {
          module: 'factures',
          actions: ['lire']
        },
        {
          module: 'bons-commande',
          actions: ['lire', 'creer']
        }
      ],
      statut: 'actif',
      dateCreation: new Date('2024-01-08'),
      agenceId: agence2._id
    });

    // Create agent users
    const agentUser1 = await User.create({
      email: 'agent@test.com',
      password: 'demo123',
      nom: 'Test',
      prenom: 'Agent',
      role: 'agent',
      agenceId: agence2._id,
      statut: 'actif',
      permissions: [
        {
          module: 'clients',
          actions: ['lire', 'creer', 'modifier']
        },
        {
          module: 'factures',
          actions: ['lire', 'creer']
        },
        {
          module: 'reservations',
          actions: ['lire', 'creer']
        },
        {
          module: 'todos',
          actions: ['lire', 'creer', 'modifier']
        },
        {
          module: 'documents',
          actions: ['lire', 'creer']
        },
        {
          module: 'calendrier',
          actions: ['lire', 'creer']
        }
      ]
    });

    console.log('Agents created...'.green);

    // Create clients
    const client1 = await Client.create({
      nom: 'Dubois',
      prenom: 'Martin',
      email: 'martin.dubois@email.com',
      telephone: '+33 1 23 45 67 89',
      adresse: '123 Rue de la Paix, 75001 Paris',
      solde: 1250.50,
      dateCreation: new Date('2024-01-10'),
      agenceId: agence2._id
    });

    const client2 = await Client.create({
      nom: 'Entreprise ABC',
      entreprise: 'ABC Solutions',
      email: 'contact@abc-solutions.com',
      telephone: '+33 1 98 76 54 32',
      adresse: '456 Avenue des Affaires, 69002 Lyon',
      solde: -450.00,
      dateCreation: new Date('2024-01-08'),
      agenceId: agence2._id
    });

    const client3 = await Client.create({
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@email.com',
      telephone: '+33 4 56 78 90 12',
      adresse: '789 Boulevard du Commerce, 13001 Marseille',
      solde: 0,
      dateCreation: new Date('2024-01-05'),
      agenceId: agence2._id
    });

    console.log('Clients created...'.green);

    // Create factures
    const facture1 = await Facture.create({
      numero: 'FAC-2024-001',
      clientId: client1._id,
      dateEmission: new Date('2024-01-15'),
      dateEcheance: new Date('2024-02-15'),
      statut: 'payee',
      montantHT: 1000,
      montantTTC: 1200,
      articles: [
        {
          designation: 'Package Voyage Paris-Rome',
          quantite: 1,
          prixUnitaire: 1000,
          montant: 1000
        }
      ],
      agenceId: agence2._id
    });

    const facture2 = await Facture.create({
      numero: 'FAC-2024-002',
      clientId: client2._id,
      dateEmission: new Date('2024-01-10'),
      dateEcheance: new Date('2024-01-25'),
      statut: 'en_retard',
      montantHT: 2500,
      montantTTC: 3000,
      articles: [
        {
          designation: 'Séminaire entreprise - 3 jours',
          quantite: 1,
          prixUnitaire: 2500,
          montant: 2500
        }
      ],
      agenceId: agence2._id
    });

    console.log('Factures created...'.green);

    // Create bons de commande
    const bonCommande1 = await BonCommande.create({
      numero: 'BC-2024-001',
      clientId: client1._id,
      dateCreation: new Date('2024-01-15'),
      statut: 'envoye',
      montantHT: 1000,
      montantTTC: 1200,
      articles: [
        {
          designation: 'Package Voyage Paris-Rome',
          quantite: 1,
          prixUnitaire: 1000,
          montant: 1000
        }
      ],
      agenceId: agence2._id
    });

    console.log('Bons de commande created...'.green);

    // Create operations
    const operation1 = await Operation.create({
      type: 'entree',
      montant: 1200.00,
      description: 'Paiement facture #FAC-2024-001',
      date: new Date('2024-01-15T10:30:00'),
      categorie: 'Vente de voyage',
      reference: 'FAC-2024-001',
      agenceId: agence2._id
    });

    const operation2 = await Operation.create({
      type: 'sortie',
      montant: 450.00,
      description: 'Paiement fournisseur - Hôtel Partenaire',
      date: new Date('2024-01-14T14:20:00'),
      categorie: 'Frais fournisseur',
      reference: 'FOUR-001',
      agenceId: agence2._id
    });

    console.log('Operations created...'.green);

    // Create packages
    const package1 = await Package.create({
      nom: 'Séjour Paris Romantique',
      description: 'Un week-end romantique à Paris avec hébergement 4 étoiles et dîner aux chandelles',
      prix: 450.00,
      duree: '3 jours / 2 nuits',
      inclusions: [
        'Hébergement 4 étoiles',
        'Petit-déjeuner',
        'Dîner romantique',
        'Visite guidée de Montmartre',
        'Croisière sur la Seine'
      ],
      visible: true,
      dateCreation: new Date('2024-01-15'),
      agenceId: agence2._id
    });

    console.log('Packages created...'.green);

    // Create billets
    const billet1 = await Billet.create({
      numeroVol: 'AF1234',
      compagnie: 'Air France',
      dateDepart: new Date('2024-02-15T08:30:00'),
      dateArrivee: new Date('2024-02-15T10:45:00'),
      origine: 'Paris (CDG)',
      destination: 'Rome (FCO)',
      passager: 'Martin Dubois',
      prix: 245.00,
      statut: 'confirme',
      clientId: client1._id,
      agenceId: agence2._id
    });

    console.log('Billets created...'.green);

    // Create fournisseurs
    const fournisseur1 = await Fournisseur.create({
      nom: 'Transport Express',
      entreprise: 'Transport Express SARL',
      email: 'contact@transport-express.com',
      telephone: '+33 1 23 45 67 89',
      adresse: '123 Rue du Transport, 75001 Paris',
      solde: -2500.00,
      dateCreation: new Date('2024-01-10'),
      agenceId: agence2._id
    });

    console.log('Fournisseurs created...'.green);

    // Create documents
    const document1 = await Document.create({
      nom: 'Contrat_Voyage_Rome_Martin_Dubois.pdf',
      type: 'pdf',
      taille: 245760,
      clientId: client1._id,
      clientNom: 'Martin Dubois',
      categorie: 'contrat',
      dateCreation: new Date('2024-01-15T10:30:00'),
      dateModification: new Date('2024-01-15T10:30:00'),
      url: '/documents/contrat_voyage_rome.pdf',
      description: 'Contrat pour le voyage à Rome du 15-18 février 2024',
      agenceId: agence2._id
    });

    console.log('Documents created...'.green);

    // Create reservations
    const reservation1 = await Reservation.create({
      numero: 'RES-2024-001',
      clientId: client1._id,
      clientNom: 'Martin Dubois',
      type: 'package',
      destination: 'Rome, Italie',
      dateDepart: new Date('2024-02-15'),
      dateRetour: new Date('2024-02-18'),
      nombrePersonnes: 2,
      montant: 1200.00,
      statut: 'confirmee',
      dateCreation: new Date('2024-01-15'),
      notes: 'Voyage de noces - demande chambre avec vue',
      agenceId: agence2._id
    });

    console.log('Reservations created...'.green);

    // Create todos
    const todo1 = await Todo.create({
      titre: 'Rappeler Martin Dubois',
      description: 'Confirmer les dates de voyage pour le package Rome',
      clientId: client1._id,
      clientNom: 'Martin Dubois',
      dateEcheance: new Date('2024-01-20T10:00:00'),
      priorite: 'haute',
      statut: 'en_attente',
      type: 'rappel',
      dateCreation: new Date('2024-01-15T09:00:00'),
      assigneA: 'Sophie Martin',
      agenceId: agence2._id
    });

    console.log('Todos created...'.green);

    // Create tickets
    const ticket1 = await Ticket.create({
      agenceId: agence1._id,
      sujet: 'Problème de connexion',
      description: 'Impossible de se connecter à la plateforme depuis ce matin. Le message d\'erreur indique "Identifiants incorrects" alors que nous utilisons les bons identifiants.',
      statut: 'ouvert',
      priorite: 'haute',
      dateCreation: new Date('2024-01-15T10:30:00'),
      dateMAJ: new Date('2024-01-15T10:30:00')
    });

    console.log('Tickets created...'.green);

    console.log('All data imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Delete all data
const destroyData = async () => {
  try {
    // Clear all collections
    await User.deleteMany();
    await Agence.deleteMany();
    await Client.deleteMany();
    await Facture.deleteMany();
    await BonCommande.deleteMany();
    await Operation.deleteMany();
    await Package.deleteMany();
    await Billet.deleteMany();
    await Fournisseur.deleteMany();
    await Document.deleteMany();
    await Reservation.deleteMany();
    await Todo.deleteMany();
    await Ticket.deleteMany();
    await Agent.deleteMany();

    console.log('Data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}