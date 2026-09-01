const mongoose = require('mongoose');

const ecmeSchema = new mongoose.Schema(
  {
    code_ecme: { type: String, required: true, unique: true, trim: true },
    designation: { type: String, default: '' },
    marque: { type: String, default: '' },
    modele: { type: String, default: '' },
    numero_serie: { type: String, default: '' },
    date_achat: { type: Date },
    date_mise_en_service: { type: Date },
    propriete: { type: String, enum: ['RAI', 'CLIENT'], default: 'RAI' },
    verification: { type: String, enum: ['INTERNE', 'EXTERNE'], default: 'INTERNE' },
    affectation: { type: String, default: '' },
    date_affectation: { type: Date },
    grandeur: { type: String, default: '' },
    tolerance: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ecme', ecmeSchema);
