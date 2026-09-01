const mongoose = require('mongoose');

const typeProduitSchema = new mongoose.Schema(
  {
    designation: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TypeProduit', typeProduitSchema);
