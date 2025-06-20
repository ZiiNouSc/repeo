const mongoose = require('mongoose');

const fournisseurSchema = mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
    },
    entreprise: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
      required: true,
    },
    adresse: {
      type: String,
      required: true,
    },
    solde: {
      type: Number,
      default: 0,
    },
    dateCreation: {
      type: Date,
      default: Date.now,
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

const Fournisseur = mongoose.model('Fournisseur', fournisseurSchema);

module.exports = Fournisseur;