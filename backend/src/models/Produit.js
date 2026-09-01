const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, trim: true },
    indice: { type: String, default: '' },
    type_produit: { type: mongoose.Schema.Types.ObjectId, ref: 'TypeProduit' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    designation: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Produit', produitSchema);
