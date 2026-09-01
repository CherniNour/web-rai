const mongoose = require('mongoose');

const ressourceSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    type: { type: String, enum: ['NOTE', 'PDF', 'VIDEO', 'IMAGE'], default: 'PDF' },
    url: { type: String, default: '' },
    description: { type: String, default: '' },
    uploader: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ressource', ressourceSchema);
