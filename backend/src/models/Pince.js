const mongoose = require('mongoose');

const pinceSchema = new mongoose.Schema(
  {
    numero_pince: { type: String, required: true, unique: true, trim: true },
    designation: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pince', pinceSchema);
