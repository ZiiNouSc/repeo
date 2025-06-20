const mongoose = require('mongoose');

const agenceSchema = mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    telephone: {
      type: String,
      required: true,
    },
    adresse: {
      type: String,
      required: true,
    },
    statut: {
      type: String,
      enum: ['en_attente', 'approuve', 'rejete', 'suspendu'],
      default: 'en_attente',
    },
    dateInscription: {
      type: Date,
      default: Date.now,
    },
    modulesActifs: {
      type: [String],
      default: [],
    },
    modulesChoisis: {
      type: [String],
      default: [],
    },
    typeActivite: {
      type: String,
      default: 'agence-voyage',
    },
    siret: {
      type: String,
    },
    vitrineConfig: {
      isActive: {
        type: Boolean,
        default: true,
      },
      domainName: String,
      title: String,
      description: String,
      logo: String,
      bannerImage: String,
      primaryColor: {
        type: String,
        default: '#3B82F6',
      },
      secondaryColor: {
        type: String,
        default: '#1E40AF',
      },
      showPackages: {
        type: Boolean,
        default: true,
      },
      showContact: {
        type: Boolean,
        default: true,
      },
      showAbout: {
        type: Boolean,
        default: true,
      },
      contactInfo: {
        phone: String,
        email: String,
        address: String,
        hours: String,
      },
      aboutText: String,
      socialLinks: {
        facebook: String,
        instagram: String,
        twitter: String,
      },
    },
    parametres: {
      nomAgence: String,
      fuseau: {
        type: String,
        default: 'Europe/Paris',
      },
      langue: {
        type: String,
        default: 'fr',
      },
      devise: {
        type: String,
        default: 'EUR',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      notificationFactures: {
        type: Boolean,
        default: true,
      },
      notificationPaiements: {
        type: Boolean,
        default: true,
      },
      notificationRappels: {
        type: Boolean,
        default: true,
      },
      authentificationDouble: {
        type: Boolean,
        default: false,
      },
      sessionTimeout: {
        type: Number,
        default: 30,
      },
      tentativesConnexion: {
        type: Number,
        default: 5,
      },
      numeroFactureAuto: {
        type: Boolean,
        default: true,
      },
      prefixeFacture: {
        type: String,
        default: 'FAC',
      },
      tvaDefaut: {
        type: Number,
        default: 20,
      },
      conditionsPaiement: {
        type: String,
        default: '30 jours',
      },
      sauvegardeAuto: {
        type: Boolean,
        default: true,
      },
      frequenceSauvegarde: {
        type: String,
        default: 'quotidienne',
      },
      derniereSauvegarde: {
        type: Date,
        default: Date.now,
      },
      apiKey: String,
      webhookUrl: String,
      integrationComptable: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Agence = mongoose.model('Agence', agenceSchema);

module.exports = Agence;