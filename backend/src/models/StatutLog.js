const mongoose = require('mongoose');

const statutLogSchema = new mongoose.Schema(
  {
    equipement: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipement', required: true },
    ancien_statut: { type: String, enum: ['EN_SERVICE', 'HORS_SERVICE'] },
    nouveau_statut: { type: String, enum: ['EN_SERVICE', 'HORS_SERVICE'], required: true },
    utilisateur: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    motif: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StatutLog', statutLogSchema);
