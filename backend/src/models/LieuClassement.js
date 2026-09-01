const mongoose = require('mongoose');

const lieuClassementSchema = new mongoose.Schema(
  {
    lieu: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LieuClassement', lieuClassementSchema);
