const mongoose = require('mongoose');

const outilSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique: true, trim: true },
    reference: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Outil', outilSchema);
