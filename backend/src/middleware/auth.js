const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'web_rai_secret_key_change_me_in_production');
    const user = await User.findById(decoded.id);
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Utilisateur introuvable ou désactivé' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};
