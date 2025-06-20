const mongoose = require('mongoose');

const billetSchema = mongoose.Schema(
  {
    numeroVol: {
      type: String,
      required: true,
    },
    compagnie: {
      type: String,
      required: true,
    },
    dateDepart: {
      type: Date,
      required: true,
    },
    dateArrivee: {
      type: Date,
      required: true,
    },
    origine: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    passager: {
      type: String,
      required: true,
    },
    prix: {
      type: Number,
      required: true,
    },
    statut: {
      type: String,
      enum: ['confirme', 'annule', 'en_attente'],
      default: 'en_attente',
    },
    agenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agence',
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  },
  {
    timestamps: true,
  }
);

const Billet = mongoose.model('Billet', billetSchema);

module.exports = Billet;