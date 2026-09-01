const express = require('express');
const Indicateur = require('../models/Indicateur');
const makeCrud = require('./crud');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();
router.use(auth);

const indicateurCrud = makeCrud(Indicateur);

router.get('/indicateurs', indicateurCrud.list);
router.post('/indicateurs', requireRole('maintenance', 'admin'), indicateurCrud.create);
router.put('/indicateurs/:id', requireRole('maintenance', 'admin'), indicateurCrud.update);
router.delete('/indicateurs/:id', requireRole('admin'), indicateurCrud.remove);

module.exports = router;
