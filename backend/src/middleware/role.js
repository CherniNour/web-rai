module.exports = function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'Authentification requise' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Droits insuffisants pour cette action' });
    }
    next();
  };
};
