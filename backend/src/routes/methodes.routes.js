const express = require('express');
const Client = require('../models/Client');
const TypeProduit = require('../models/TypeProduit');
const Produit = require('../models/Produit');
const LieuClassement = require('../models/LieuClassement');
const Specification = require('../models/Specification');
const DossierFabrication = require('../models/DossierFabrication');
const makeCrud = require('./crud');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();
router.use(auth);

const admin = requireRole('admin');
const method = requireRole('maintenance', 'admin');

const clientCrud = makeCrud(Client);
const typeProduitCrud = makeCrud(TypeProduit);
const produitCrud = makeCrud(Produit, { populates: ['type_produit', 'client'] });
const lieuCrud = makeCrud(LieuClassement);
const specCrud = makeCrud(Specification, { populates: ['client', 'lieu_classement'] });
const dossierCrud = makeCrud(DossierFabrication, {
  populates: ['ref_produit', 'client', 'type_produit', 'lieu_classement'],
});

router.get('/clients', clientCrud.list);
router.post('/clients', method, clientCrud.create);
router.put('/clients/:id', method, clientCrud.update);
router.delete('/clients/:id', admin, clientCrud.remove);

router.get('/types-produits', typeProduitCrud.list);
router.post('/types-produits', method, typeProduitCrud.create);
router.put('/types-produits/:id', method, typeProduitCrud.update);
router.delete('/types-produits/:id', admin, typeProduitCrud.remove);

router.get('/produits', produitCrud.list);
router.post('/produits', method, produitCrud.create);
router.put('/produits/:id', method, produitCrud.update);
router.delete('/produits/:id', admin, produitCrud.remove);

router.get('/lieux-classement', lieuCrud.list);
router.post('/lieux-classement', method, lieuCrud.create);
router.put('/lieux-classement/:id', method, lieuCrud.update);
router.delete('/lieux-classement/:id', admin, lieuCrud.remove);

router.get('/specifications', specCrud.list);
router.post('/specifications', method, specCrud.create);
router.put('/specifications/:id', method, specCrud.update);
router.delete('/specifications/:id', admin, specCrud.remove);

router.get('/dossiers', dossierCrud.list);
router.post('/dossiers', method, dossierCrud.create);
router.put('/dossiers/:id', method, dossierCrud.update);
router.delete('/dossiers/:id', admin, dossierCrud.remove);

module.exports = router;
