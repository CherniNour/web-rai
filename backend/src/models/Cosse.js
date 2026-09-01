const mongoose = require('mongoose');

const cosseSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, trim: true },
    designation: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cosse', cosseSchema);
