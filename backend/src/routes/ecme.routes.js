const express = require('express');
const Ecme = require('../models/Ecme');
const EcmeVerification = require('../models/EcmeVerification');
const makeCrud = require('./crud');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();
router.use(auth);

const ecmeCrud = makeCrud(Ecme);
const verificationCrud = makeCrud(EcmeVerification, { populates: ['ecme'] });

router.get('/ecme', ecmeCrud.list);
router.post('/ecme', requireRole('maintenance', 'admin'), ecmeCrud.create);
router.put('/ecme/:id', requireRole('maintenance', 'admin'), ecmeCrud.update);
router.delete('/ecme/:id', requireRole('admin'), ecmeCrud.remove);

router.get('/verifications', verificationCrud.list);
router.post('/verifications', requireRole('maintenance', 'admin'), verificationCrud.create);
router.put('/verifications/:id', requireRole('maintenance', 'admin'), verificationCrud.update);
router.delete('/verifications/:id', requireRole('admin'), verificationCrud.remove);

router.get('/etat', async (req, res) => {
  try {
    const ecmes = await Ecme.find().lean();
    const verifs = await EcmeVerification.find().sort({ date_verification: 1 }).lean();
    const today = new Date();

    const result = ecmes.map((e) => {
      const list = verifs.filter((v) => String(v.ecme) === String(e._id));
      const derniere = list[list.length - 1];
      const prochaine = derniere ? derniere.date_prochaine_verification : null;
      let statut = 'A_VERIFIER';
      if (prochaine) {
        const days = (prochaine - today) / (1000 * 60 * 60 * 24);
        statut = days < 0 ? 'ECHUE' : days <= 30 ? 'CRITIQUE' : 'OK';
      }
      return {
        ...e,
        derniereVerification: derniere || null,
        nombreVerifications: list.length,
        statut,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
