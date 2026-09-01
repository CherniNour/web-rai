const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    nom_zone: { type: String, required: true, unique: true, trim: true },
    localisation: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Zone', zoneSchema);
