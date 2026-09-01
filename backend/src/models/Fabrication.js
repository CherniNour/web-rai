const mongoose = require('mongoose');

const fabricationSchema = new mongoose.Schema(
  {
    code_processus: { type: String, required: true, unique: true, trim: true },
    dossier: { type: mongoose.Schema.Types.ObjectId, ref: 'DossierFabrication' },
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
    indice: { type: String, default: '' },
    operations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Operation' }],
    ressources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ressource' }],
    description: { type: String, default: '' },
    statut: { type: String, enum: ['EN_ELABORATION', 'VALIDE', 'ARCHIVE'], default: 'EN_ELABORATION' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fabrication', fabricationSchema);
