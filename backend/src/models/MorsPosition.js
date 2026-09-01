const mongoose = require('mongoose');

const morsPositionSchema = new mongoose.Schema(
  {
    mors: { type: mongoose.Schema.Types.ObjectId, ref: 'Mors', required: true },
    position: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

morsPositionSchema.index({ mors: 1, position: 1 }, { unique: true });
module.exports = mongoose.model('MorsPosition', morsPositionSchema);
