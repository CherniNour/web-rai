const mongoose = require('mongoose');

const indicateurSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    libelle: { type: String, required: true, trim: true },
    categorie: {
      type: String,
      enum: ['METHODE', 'INDUSTRIALISATION', 'QUALITE', 'PRODUCTION'],
      default: 'METHODE',
    },
    unite: { type: String, default: '' },
    cible: { type: Number, default: 0 },
    valeur: { type: Number, default: 0 },
    periode: { type: String, default: '' },
    commentaire: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Indicateur', indicateurSchema);
