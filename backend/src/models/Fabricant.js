const mongoose = require('mongoose');

const fabricantSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique: true, trim: true },
    pays: { type: String, default: '' },
    contact: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fabricant', fabricantSchema);
