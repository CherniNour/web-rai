const mongoose = require('mongoose');

const cosseFilSchema = new mongoose.Schema(
  {
    cosse: { type: mongoose.Schema.Types.ObjectId, ref: 'Cosse', required: true },
    fil: { type: mongoose.Schema.Types.ObjectId, ref: 'Fil', required: true },
  },
  { timestamps: true }
);

cosseFilSchema.index({ cosse: 1, fil: 1 }, { unique: true });
module.exports = mongoose.model('CosseFil', cosseFilSchema);
