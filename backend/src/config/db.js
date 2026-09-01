require('dotenv').config();
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/web_rai';
  try {
    await mongoose.connect(uri);
    console.log('[DB] Connecté à MongoDB :', uri);
  } catch (err) {
    console.error('[DB] Erreur de connexion MongoDB :', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;


