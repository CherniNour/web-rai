const mongoose = require('mongoose');

const morsSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, trim: true },
    designation: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mors', morsSchema);
