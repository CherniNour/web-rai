const express = require('express');
const Zone = require('../models/Zone');
const Fabricant = require('../models/Fabricant');
const Modele = require('../models/Modele');
const Categorie = require('../models/Categorie');
const Equipement = require('../models/Equipement');
const StatutLog = require('../models/StatutLog');
const makeCrud = require('./crud');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

router.use(auth);

const zoneCrud = makeCrud(Zone);
const fabricantCrud = makeCrud(Fabricant);
const modeleCrud = makeCrud(Modele);
const categorieCrud = makeCrud(Categorie);
const equipementCrud = makeCrud(Equipement, {
  populates: ['zone', 'fabricant', 'modele', 'categorie'],
});

router.get('/zones', zoneCrud.list);
router.post('/zones', requireRole('admin'), zoneCrud.create);
router.put('/zones/:id', requireRole('admin'), zoneCrud.update);
router.delete('/zones/:id', requireRole('admin'), zoneCrud.remove);

router.get('/fabricants', fabricantCrud.list);
router.post('/fabricants', requireRole('admin'), fabricantCrud.create);
router.put('/fabricants/:id', requireRole('admin'), fabricantCrud.update);
router.delete('/fabricants/:id', requireRole('admin'), fabricantCrud.remove);

router.get('/modeles', modeleCrud.list);
router.get('/modeles/:id', modeleCrud.getOne);
router.post('/modeles', requireRole('admin'), modeleCrud.create);
router.put('/modeles/:id', requireRole('admin'), modeleCrud.update);
router.delete('/modeles/:id', requireRole('admin'), modeleCrud.remove);

router.get('/categories', categorieCrud.list);
router.post('/categories', requireRole('admin'), categorieCrud.create);
router.put('/categories/:id', requireRole('admin'), categorieCrud.update);
router.delete('/categories/:id', requireRole('admin'), categorieCrud.remove);

router.get('/equipements', equipementCrud.list);
router.get('/equipements/:id', equipementCrud.getOne);
router.post('/equipements', requireRole('admin'), equipementCrud.create);
router.put('/equipements/:id', requireRole('admin'), equipementCrud.update);
router.delete('/equipements/:id', requireRole('admin'), equipementCrud.remove);

router.put('/equipements/:id/statut', requireRole('operateur', 'maintenance', 'admin'), async (req, res) => {
  try {
    const { statut, motif } = req.body;
    if (!['EN_SERVICE', 'HORS_SERVICE'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    const equipement = await Equipement.findById(req.params.id);
    if (!equipement) return res.status(404).json({ message: 'Équipement introuvable' });

    const ancien = equipement.statut;
    equipement.statut = statut;
    await equipement.save();

    await StatutLog.create({
      equipement: equipement._id,
      ancien_statut: ancien,
      nouveau_statut: statut,
      utilisateur: req.user.username,
      motif: motif || '',
    });

    const updated = await Equipement.findById(equipement._id)
      .populate(['zone', 'fabricant', 'modele', 'categorie'])
      .lean();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/sommaire', async (req, res) => {
  try {
    const total = await Equipement.countDocuments();
    const enService = await Equipement.countDocuments({ statut: 'EN_SERVICE' });
    const horsService = await Equipement.countDocuments({ statut: 'HORS_SERVICE' });

    const parZone = await Equipement.aggregate([
      {
        $lookup: {
          from: 'zones',
          localField: 'zone',
          foreignField: '_id',
          as: 'zoneInfo',
        },
      },
      { $unwind: { path: '$zoneInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { zone: '$zoneInfo.nom_zone' },
          total: { $sum: 1 },
          en_service: {
            $sum: { $cond: [{ $eq: ['$statut', 'EN_SERVICE'] }, 1, 0] },
          },
          hors_service: {
            $sum: { $cond: [{ $eq: ['$statut', 'HORS_SERVICE'] }, 1, 0] },
          },
        },
      },
      { $project: { _id: 0, zone: '$_id.zone', total: 1, en_service: 1, hors_service: 1 } },
      { $sort: { zone: 1 } },
    ]);

    res.json({
      total,
      enService,
      horsService,
      tauxDefaillance: total ? Math.round((horsService / total) * 10000) / 100 : 0,
      parZone,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/historique/statuts', async (req, res) => {
  try {
    const { debut, fin } = req.query;
    const filter = {};
    if (debut || fin) {
      filter.date = {};
      if (debut) filter.date.$gte = new Date(debut);
      if (fin) filter.date.$lte = new Date(fin);
    }
    const logs = await StatutLog.find(filter)
      .populate('equipement', 'code_rai designation')
      .sort({ date: -1 })
      .limit(500)
      .lean();
    res.json(logs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
