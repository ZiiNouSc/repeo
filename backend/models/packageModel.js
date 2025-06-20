const mongoose = require('mongoose');

const packageSchema = mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    prix: {
      type: Number,
      required: true,
    },
    duree: {
      type: String,
      required: true,
    },
    inclusions: {
      type: [String],
      default: [],
    },
    visible: {
      type: Boolean,
      default: true,
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

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;