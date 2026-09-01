const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique: true, trim: true },
    adresse: { type: String, default: '' },
    contact: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
