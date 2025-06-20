const mongoose = require('mongoose');

const clientSchema = mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
    },
    prenom: {
      type: String,
      default: '',
    },
    entreprise: {
      type: String,
      default: '',
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

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;