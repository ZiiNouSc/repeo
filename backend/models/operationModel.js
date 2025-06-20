const mongoose = require('mongoose');

const operationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['entree', 'sortie'],
      required: true,
    },
    montant: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    categorie: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      default: '',
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

const Operation = mongoose.model('Operation', operationSchema);

module.exports = Operation;