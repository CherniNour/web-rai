const mongoose = require('mongoose');

const configurationSertissageSchema = new mongoose.Schema(
  {
    pince: { type: mongoose.Schema.Types.ObjectId, ref: 'Pince', required: true },
    mors: { type: mongoose.Schema.Types.ObjectId, ref: 'Mors', required: true },
    position: { type: String, required: true, trim: true },
    cosse: { type: mongoose.Schema.Types.ObjectId, ref: 'Cosse', required: true },
    fil: { type: mongoose.Schema.Types.ObjectId, ref: 'Fil', required: true },
    tenue_traction_minimale: { type: Number, default: 0 },
  },
  { timestamps: true }
);

configurationSertissageSchema.index(
  { pince: 1, mors: 1, position: 1, cosse: 1, fil: 1 },
  { unique: true }
);
module.exports = mongoose.model('ConfigurationSertissage', configurationSertissageSchema);
