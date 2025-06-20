const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema(
  {
    agenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agence',
      required: true,
    },
    sujet: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    statut: {
      type: String,
      enum: ['ouvert', 'en_cours', 'ferme'],
      default: 'ouvert',
    },
    priorite: {
      type: String,
      enum: ['faible', 'normale', 'haute', 'urgente'],
      default: 'normale',
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    dateMAJ: {
      type: Date,
      default: Date.now,
    },
    reponses: [
      {
        message: String,
        date: {
          type: Date,
          default: Date.now,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        userName: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;