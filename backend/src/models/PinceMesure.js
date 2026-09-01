const mongoose = require('mongoose');

const pinceMesureSchema = new mongoose.Schema(
  {
    date_mesure: { type: Date, default: Date.now },
    pince: { type: mongoose.Schema.Types.ObjectId, ref: 'Pince', required: true },
    mors: { type: mongoose.Schema.Types.ObjectId, ref: 'Mors' },
    position: { type: String, default: '' },
    cosse: { type: mongoose.Schema.Types.ObjectId, ref: 'Cosse' },
    fil: { type: mongoose.Schema.Types.ObjectId, ref: 'Fil' },
    tenue_traction_minimale: { type: Number, default: 0 },
    valeurs: [{ type: Number }],
    prochaine_date: { type: Date },
    statut: { type: String, enum: ['CONFORME', 'NON_CONFORME'], default: 'CONFORME' },
    operateur: { type: String, default: '' },
    remarque: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PinceMesure', pinceMesureSchema);
