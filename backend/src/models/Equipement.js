const mongoose = require('mongoose');

const equipementSchema = new mongoose.Schema(
  {
    code_rai: { type: String, required: true, unique: true, trim: true },
    designation: { type: String, required: true, trim: true },
    numero_serie: { type: String, default: '' },
    date_acquisition: { type: Date },
    remarque: { type: String, default: '' },
    statut: { type: String, enum: ['EN_SERVICE', 'HORS_SERVICE'], default: 'EN_SERVICE' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    fabricant: { type: mongoose.Schema.Types.ObjectId, ref: 'Fabricant' },
    modele: { type: mongoose.Schema.Types.ObjectId, ref: 'Modele' },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipement', equipementSchema);
