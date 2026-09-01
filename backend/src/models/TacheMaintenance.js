const mongoose = require('mongoose');

const tacheMaintenanceSchema = new mongoose.Schema(
  {
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie' },
    description: { type: String, required: true, trim: true },
    frequence: {
      type: String,
      enum: ['MENSUELLE', 'TRIMESTRIELLE', 'SEMESTRIELLE', 'ANNUELLE'],
      default: 'MENSUELLE',
    },
    temps_estime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TacheMaintenance', tacheMaintenanceSchema);
