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

const bonCommandeSchema = mongoose.Schema(
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
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    statut: {
      type: String,
      enum: ['brouillon', 'envoye', 'accepte', 'refuse', 'facture'],
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

const BonCommande = mongoose.model('BonCommande', bonCommandeSchema);

module.exports = BonCommande;