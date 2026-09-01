const mongoose = require('mongoose');

const filSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, trim: true },
    section: { type: String, default: '' },
    couleur: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fil', filSchema);
