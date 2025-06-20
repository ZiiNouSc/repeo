const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema(
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
    clientNom: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['vol', 'hotel', 'package', 'transport'],
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    dateDepart: {
      type: Date,
      required: true,
    },
    dateRetour: {
      type: Date,
      required: true,
    },
    nombrePersonnes: {
      type: Number,
      required: true,
    },
    montant: {
      type: Number,
      required: true,
    },
    statut: {
      type: String,
      enum: ['confirmee', 'en_attente', 'annulee', 'terminee'],
      default: 'en_attente',
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
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

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;