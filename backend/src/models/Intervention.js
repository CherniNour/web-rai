const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema(
  {
    equipement: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipement', required: true },
    numero: { type: String, default: '' },
    type_intervention: {
      type: String,
      enum: ['PREVENTIVE', 'CORRECTIVE', 'CONTROLE_PERIODIQUE'],
      default: 'PREVENTIVE',
    },
    tache: { type: mongoose.Schema.Types.ObjectId, ref: 'TacheMaintenance' },
    date: { type: Date, default: Date.now },
    temps_reel: { type: Number, default: 0 },
    technicien: { type: String, default: '' },
    remarque: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Intervention', interventionSchema);
