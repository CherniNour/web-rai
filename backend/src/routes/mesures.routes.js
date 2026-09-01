const express = require('express');
const PinceMesure = require('../models/PinceMesure');
const makeCrud = require('./crud');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();
router.use(auth);

const mesureCrud = makeCrud(PinceMesure, {
  populates: ['pince', 'mors', 'cosse', 'fil'],
});

router.get('/mesures', mesureCrud.list);
router.get('/mesures/:id', mesureCrud.getOne);
router.post('/mesures', requireRole('maintenance', 'admin', 'operateur'), async (req, res) => {
  try {
    const body = { ...req.body };
    if (Array.isArray(body.valeurs)) body.valeurs = body.valeurs.map(Number);
    if (body.tenue_traction_minimale) body.tenue_traction_minimale = Number(body.tenue_traction_minimale);

    const mesures = (body.valeurs || []).filter((v) => v != null && v !== '');
    if (body.tenue_traction_minimale && mesures.length) {
      const min = Math.min(...mesures);
      body.statut = min >= body.tenue_traction_minimale ? 'CONFORME' : 'NON_CONFORME';
    }
    if (!body.operateur) body.operateur = req.user.username;

    const item = await PinceMesure.create(body);
    const populated = await PinceMesure.findById(item._id).populate(['pince', 'mors', 'cosse', 'fil']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.put('/mesures/:id', requireRole('maintenance', 'admin'), mesureCrud.update);
router.delete('/mesures/:id', requireRole('admin'), mesureCrud.remove);

module.exports = router;
