const mongoose = require('mongoose');

const modeleSchema = new mongoose.Schema(
  {
    fabricant: { type: mongoose.Schema.Types.ObjectId, ref: 'Fabricant' },
    nom: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Modele', modeleSchema);
