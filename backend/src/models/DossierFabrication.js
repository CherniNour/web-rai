const mongoose = require('mongoose');

const dossierFabricationSchema = new mongoose.Schema(
  {
    ref_produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
    designation: { type: String, default: '' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    type_produit: { type: mongoose.Schema.Types.ObjectId, ref: 'TypeProduit' },
    lieu_classement: { type: mongoose.Schema.Types.ObjectId, ref: 'LieuClassement' },
    nombre_copies: { type: Number, default: 1 },
    date_creation: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DossierFabrication', dossierFabricationSchema);
