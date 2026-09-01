const express = require('express');
const Equipement = require('../models/Equipement');
const Ecme = require('../models/Ecme');
const EcmeVerification = require('../models/EcmeVerification');
const PinceMesure = require('../models/PinceMesure');
const StatutLog = require('../models/StatutLog');
const Intervention = require('../models/Intervention');
const TempsArret = require('../models/TempsArret');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/synthese', async (req, res) => {
  try {
    const total = await Equipement.countDocuments();
    const enService = await Equipement.countDocuments({ statut: 'EN_SERVICE' });
    const horsService = await Equipement.countDocuments({ statut: 'HORS_SERVICE' });
    const totalEcme = await Ecme.countDocuments();
    const totalInterventions = await Intervention.countDocuments();
    const totalTempsArret = await TempsArret.aggregate([
      { $group: { _id: null, total: { $sum: '$temps_arret' } } },
    ]);
    const totalArret = totalTempsArret[0] ? totalTempsArret[0].total : 0;

    const parZone = await Equipement.aggregate([
      {
        $lookup: { from: 'zones', localField: 'zone', foreignField: '_id', as: 'z' },
      },
      { $unwind: { path: '$z', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$z.nom_zone',
          total: { $sum: 1 },
          ok: { $sum: { $cond: [{ $eq: ['$statut', 'EN_SERVICE'] }, 1, 0] } },
          nok: { $sum: { $cond: [{ $eq: ['$statut', 'HORS_SERVICE'] }, 1, 0] } },
        },
      },
      { $project: { _id: 0, zone: '$_id', total: 1, ok: 1, nok: 1 } },
      { $sort: { zone: 1 } },
    ]);

    const today = new Date();
    const in30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const ecmes = await Ecme.find().lean();
    const lastVerifs = await EcmeVerification.aggregate([
      { $sort: { date_verification: -1 } },
      { $group: { _id: '$ecme', doc: { $first: '$$ROOT' } } },
    ]);
    const verifByEcme = Object.fromEntries(
      lastVerifs.map((v) => [String(v._id), v.doc])
    );

    const alertes = [];
    for (const e of ecmes) {
      const v = verifByEcme[String(e._id)];
      const prochaine = v ? v.date_prochaine_verification : null;
      if (!prochaine) continue;
      const d = new Date(prochaine);
      if (d < today) {
        alertes.push({ type: 'ECME', ref: e.code_ecme, libelle: e.designation, dateLimite: d, statut: 'ECHUE' });
      } else if (d <= in30) {
        alertes.push({ type: 'ECME', ref: e.code_ecme, libelle: e.designation, dateLimite: d, statut: 'A_ECHANCHE' });
      }
    }

    const mesures = await PinceMesure.find({ prochaine_date: { $ne: null } }).populate('pince', 'numero_pince').lean();
    for (const m of mesures) {
      const d = new Date(m.prochaine_date);
      if (d < today) {
        alertes.push({ type: 'PINCE', ref: m.pince ? m.pince.numero_pince : 'N/A', libelle: 'Mesure force d\'extraction', dateLimite: d, statut: 'ECHUE' });
      } else if (d <= in30) {
        alertes.push({ type: 'PINCE', ref: m.pince ? m.pince.numero_pince : 'N/A', libelle: 'Mesure force d\'extraction', dateLimite: d, statut: 'A_ECHANCHE' });
      }
    }
    alertes.sort((a, b) => a.dateLimite - b.dateLimite);

    res.json({
      total,
      enService,
      horsService,
      tauxDefaillance: total ? Math.round((horsService / total) * 10000) / 100 : 0,
      totalEcme,
      totalInterventions,
      totalArret,
      parZone,
      alertes,
      dateGeneration: new Date(),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  return /["\n;,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) => headers.map((h) => csvEscape(row[h])).join(';'));
  return [headers.join(';'), ...lines].join('\n');
}

router.get('/historique', async (req, res) => {
  try {
    const { debut, fin, type } = req.query;
    const filter = {};
    if (debut || fin) {
      filter.date = {};
      if (debut) filter.date.$gte = new Date(debut);
      if (fin) filter.date.$lte = new Date(fin);
    }

    const statuts = await StatutLog.find(filter)
      .populate('equipement', 'code_rai designation zone')
      .sort({ date: -1 })
      .lean();
    const interventions = await Intervention.find(filter)
      .populate({ path: 'equipement', select: 'code_rai designation' })
      .sort({ date: -1 })
      .lean();

    const rows = [
      ...statuts.map((s) => ({
        Date: s.date,
        Type: 'CHANGEMENT_STATUT',
        Reference: s.equipement ? s.equipement.code_rai : '',
        Détail: `${s.ancien_statut} -> ${s.nouveau_statut}`,
        Utilisateur: s.utilisateur,
      })),
      ...interventions.map((i) => ({
        Date: i.date,
        Type: 'INTERVENTION',
        Reference: i.equipement ? i.equipement.code_rai : '',
        Détail: i.type_intervention,
        Utilisateur: i.technicien,
      })),
    ].sort((a, b) => new Date(a.Date) - new Date(b.Date));

    const filtered = type && type !== 'TOUS'
      ? rows.filter((r) => r.Type === type)
      : rows;

    if (req.query.export === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="historique-web-rai.csv"');
      const bom = '\uFEFF';
      return res.send(bom + toCsv(filtered));
    }

    res.json(filtered);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
