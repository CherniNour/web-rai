const express = require('express');
const Pince = require('../models/Pince');
const Mors = require('../models/Mors');
const MorsPosition = require('../models/MorsPosition');
const Cosse = require('../models/Cosse');
const Fil = require('../models/Fil');
const CosseFil = require('../models/CosseFil');
const ConfigurationSertissage = require('../models/ConfigurationSertissage');
const makeCrud = require('./crud');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();
router.use(auth);

const pinceCrud = makeCrud(Pince);
const morsCrud = makeCrud(Mors);
const positionCrud = makeCrud(MorsPosition, { populates: ['mors'] });
const cosseCrud = makeCrud(Cosse);
const filCrud = makeCrud(Fil);
const cosseFilCrud = makeCrud(CosseFil, { populates: ['cosse', 'fil'] });
const configCrud = makeCrud(ConfigurationSertissage, {
  populates: ['pince', 'mors', 'cosse', 'fil'],
});

const writeRoles = requireRole('maintenance', 'admin');

router.get('/pinces', pinceCrud.list);
router.post('/pinces', writeRoles, pinceCrud.create);
router.put('/pinces/:id', writeRoles, pinceCrud.update);
router.delete('/pinces/:id', requireRole('admin'), pinceCrud.remove);

router.get('/mors', morsCrud.list);
router.post('/mors', writeRoles, morsCrud.create);
router.put('/mors/:id', writeRoles, morsCrud.update);
router.delete('/mors/:id', requireRole('admin'), morsCrud.remove);

router.get('/positions', positionCrud.list);
router.post('/positions', writeRoles, positionCrud.create);
router.put('/positions/:id', writeRoles, positionCrud.update);
router.delete('/positions/:id', requireRole('admin'), positionCrud.remove);

router.get('/cosses', cosseCrud.list);
router.post('/cosses', writeRoles, cosseCrud.create);
router.put('/cosses/:id', writeRoles, cosseCrud.update);
router.delete('/cosses/:id', requireRole('admin'), cosseCrud.remove);

router.get('/fils', filCrud.list);
router.post('/fils', writeRoles, filCrud.create);
router.put('/fils/:id', writeRoles, filCrud.update);
router.delete('/fils/:id', requireRole('admin'), filCrud.remove);

router.get('/cosses-fils', cosseFilCrud.list);
router.post('/cosses-fils', writeRoles, cosseFilCrud.create);
router.put('/cosses-fils/:id', writeRoles, cosseFilCrud.update);
router.delete('/cosses-fils/:id', requireRole('admin'), cosseFilCrud.remove);

router.get('/configurations', configCrud.list);
router.get('/configurations/:id', configCrud.getOne);
router.post('/configurations', writeRoles, configCrud.create);
router.put('/configurations/:id', writeRoles, configCrud.update);
router.delete('/configurations/:id', requireRole('admin'), configCrud.remove);

module.exports = router;
