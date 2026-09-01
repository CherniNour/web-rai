const mongoose = require('mongoose');

const ecmeVerificationSchema = new mongoose.Schema(
  {
    ecme: { type: mongoose.Schema.Types.ObjectId, ref: 'Ecme', required: true },
    date_verification: { type: Date, default: Date.now },
    date_prochaine_verification: { type: Date },
    statut: { type: String, enum: ['CONFORME', 'NON_CONFORME', 'EN_COURS'], default: 'CONFORME' },
    remarques: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EcmeVerification', ecmeVerificationSchema);
