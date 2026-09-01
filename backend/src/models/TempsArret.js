const mongoose = require('mongoose');

const tempsArretSchema = new mongoose.Schema(
  {
    technicien: { type: String, default: '' },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    equipement: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipement' },
    semaine: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    heure_demande: { type: String, default: '' },
    heure_debut: { type: String, default: '' },
    heure_fin: { type: String, default: '' },
    description: { type: String, default: '' },
    temps_arret: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TempsArret', tempsArretSchema);
