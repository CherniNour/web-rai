const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Outil = require('../models/Outil');
const Composant = require('../models/Composant');
const Operation = require('../models/Operation');
const Ressource = require('../models/Ressource');
const Fabrication = require('../models/Fabrication');
const makeCrud = require('./crud');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();
router.use(auth);

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({ storage });

const method = requireRole('maintenance', 'admin');
const admin = requireRole('admin');

const outilCrud = makeCrud(Outil);
const composantCrud = makeCrud(Composant);
const operationCrud = makeCrud(Operation, {
  populates: ['equipement', 'outils', 'ressources'],
});
const ressourceCrud = makeCrud(Ressource);
const fabricationCrud = makeCrud(Fabrication, {
  populates: [{ path: 'dossier', select: 'designation' }, 'produit', 'operations', 'ressources'],
});

router.get('/outils', outilCrud.list);
router.post('/outils', method, outilCrud.create);
router.put('/outils/:id', method, outilCrud.update);
router.delete('/outils/:id', admin, outilCrud.remove);

router.get('/composants', composantCrud.list);
router.post('/composants', method, composantCrud.create);
router.put('/composants/:id', method, composantCrud.update);
router.delete('/composants/:id', admin, composantCrud.remove);

router.get('/operations', operationCrud.list);
router.post('/operations', method, operationCrud.create);
router.put('/operations/:id', method, operationCrud.update);
router.delete('/operations/:id', admin, operationCrud.remove);

router.get('/ressources', ressourceCrud.list);
router.post('/ressources', method, ressourceCrud.create);
router.post('/ressources/upload', method, upload.single('fichier'), (req, res) => {
  try {
    const typeMap = { pdf: 'PDF', video: 'VIDEO', image: 'IMAGE', note: 'NOTE' };
    const type = typeMap[req.body.type] || 'PDF';
    const ressource = {
      titre: req.body.titre || (req.file ? req.file.originalname : 'Ressource'),
      type,
      url: req.file ? `/uploads/${req.file.filename}` : '',
      description: req.body.description || '',
      uploader: req.user.username,
    };
    res.status(201).json(ressource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.put('/ressources/:id', method, ressourceCrud.update);
router.delete('/ressources/:id', admin, ressourceCrud.remove);

router.get('/fabrications', fabricationCrud.list);
router.get('/fabrications/:id', fabricationCrud.getOne);
router.post('/fabrications', method, fabricationCrud.create);
router.put('/fabrications/:id', method, fabricationCrud.update);
router.delete('/fabrications/:id', admin, fabricationCrud.remove);

module.exports = router;
