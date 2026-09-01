const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    libelle: { type: String, default: '' },
    ordre: { type: Number, default: 0 },
    equipement: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipement' },
    outils: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Outil' }],
    parametres: { type: String, default: '' },
    ressources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ressource' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Operation', operationSchema);
