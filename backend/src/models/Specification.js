const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, trim: true },
    designation: { type: String, default: '' },
    indice: { type: String, default: '' },
    date_reception: { type: Date },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    lieu_classement: { type: mongoose.Schema.Types.ObjectId, ref: 'LieuClassement' },
    nombre_copies: { type: Number, default: 1 },
    fichier: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Specification', specificationSchema);
