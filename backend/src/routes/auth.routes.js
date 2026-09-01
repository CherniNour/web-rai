const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Identifiants requis' });
    }
    const user = await User.findOne({ username });
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect' });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'web_rai_secret_key_change_me_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    res.json({
      token,
      user: { id: user._id, username: user.username, fullname: user.fullname, role: user.role },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/me', auth, (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    fullname: req.user.fullname,
    email: req.user.email,
    role: req.user.role,
  });
});

router.get('/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const { username, fullname, email, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Ce nom d\'utilisateur existe déjà' });
    const user = await User.create({ username, fullname, email, password, role: role || 'operateur' });
    res.status(201).json({ id: user._id, username: user.username, role: user.role, fullname: user.fullname });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/users/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { username, fullname, email, password, role, active } = req.body;
    const update = { username, fullname, email, role, active };
    if (password) update.password = password;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json({ id: user._id, username: user.username, role: user.role, fullname: user.fullname, active: user.active });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/users/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
