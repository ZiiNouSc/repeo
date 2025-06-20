const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
  designation: {
    type: String,
    required: true,
  },
  quantite: {
    type: Number,
    required: true,
  },
  prixUnitaire: {
    type: Number,
    required: true,
  },
  montant: {
    type: Number,
    required: true,
  },
});

const factureSchema = mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    dateEmission: {
      type: Date,
      required: true,
    },
    dateEcheance: {
      type: Date,
      required: true,
    },
    statut: {
      type: String,
      enum: ['brouillon', 'envoyee', 'payee', 'en_retard'],
      default: 'brouillon',
    },
    montantHT: {
      type: Number,
      required: true,
    },
    montantTTC: {
      type: Number,
      required: true,
    },
    articles: [articleSchema],
    lastReminder: {
      type: Date,
    },
    agenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agence',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Facture = mongoose.model('Facture', factureSchema);

module.exports = Facture;