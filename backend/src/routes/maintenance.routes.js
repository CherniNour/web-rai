const express = require('express');
const TacheMaintenance = require('../models/TacheMaintenance');
const Intervention = require('../models/Intervention');
const TempsArret = require('../models/TempsArret');
const Equipement = require('../models/Equipement');
const makeCrud = require('./crud');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();
router.use(auth);

const tacheCrud = makeCrud(TacheMaintenance, { populates: ['categorie'] });
const interventionCrud = makeCrud(Intervention, {
  populates: [{ path: 'equipement', select: 'code_rai designation zone' }, 'tache'],
});
const tempsArretCrud = makeCrud(TempsArret, {
  populates: ['zone', 'equipement'],
});

router.get('/taches', tacheCrud.list);
router.post('/taches', requireRole('maintenance', 'admin'), tacheCrud.create);
router.put('/taches/:id', requireRole('maintenance', 'admin'), tacheCrud.update);
router.delete('/taches/:id', requireRole('admin'), tacheCrud.remove);

router.get('/interventions', interventionCrud.list);
router.post('/interventions', requireRole('maintenance', 'admin'), interventionCrud.create);
router.put('/interventions/:id', requireRole('maintenance', 'admin'), interventionCrud.update);
router.delete('/interventions/:id', requireRole('admin'), interventionCrud.remove);

router.get('/temps-arret', tempsArretCrud.list);
router.post('/temps-arret', requireRole('maintenance', 'admin'), tempsArretCrud.create);
router.put('/temps-arret/:id', requireRole('maintenance', 'admin'), tempsArretCrud.update);
router.delete('/temps-arret/:id', requireRole('admin'), tempsArretCrud.remove);

router.get('/calendrier', async (req, res) => {
  try {
    const { debut, fin, zone } = req.query;
    const filter = {};
    if (debut || fin) {
      filter.date = {};
      if (debut) filter.date.$gte = new Date(debut);
      if (fin) filter.date.$lte = new Date(fin);
    }
    if (zone) filter['equipement.zone'] = zone;

    const interventions = await Intervention.find(filter)
      .populate({ path: 'equipement', select: 'code_rai designation zone statut' })
      .sort({ date: 1 })
      .lean();

    const zoneIds = [...new Set(interventions.map((i) => i.equipement && i.equipement.zone).filter(Boolean))];
    const zones = zoneIds.length
      ? await require('../models/Zone').find({ _id: { $in: zoneIds } }).lean()
      : [];
    const zoneMap = Object.fromEntries(zones.map((z) => [String(z._id), z.nom_zone]));

    const events = interventions.map((i) => ({
      id: i._id,
      title: `${i.equipement ? i.equipement.code_rai : 'N/A'} - ${i.type_intervention}`,
      start: i.date,
      type: i.type_intervention,
      technicien: i.technicien,
      zone: i.equipement ? zoneMap[i.equipement.zone] || '' : '',
      equipement: i.equipement,
    }));

    res.json(events);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
