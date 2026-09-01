require('dotenv').config();
const connectDB = require('../config/db');

const User = require('../models/User');
const Zone = require('../models/Zone');
const Fabricant = require('../models/Fabricant');
const Modele = require('../models/Modele');
const Categorie = require('../models/Categorie');
const Equipement = require('../models/Equipement');
const TacheMaintenance = require('../models/TacheMaintenance');
const Intervention = require('../models/Intervention');
const TempsArret = require('../models/TempsArret');
const Ecme = require('../models/Ecme');
const EcmeVerification = require('../models/EcmeVerification');
const Pince = require('../models/Pince');
const Mors = require('../models/Mors');
const MorsPosition = require('../models/MorsPosition');
const Cosse = require('../models/Cosse');
const Fil = require('../models/Fil');
const CosseFil = require('../models/CosseFil');
const ConfigurationSertissage = require('../models/ConfigurationSertissage');
const PinceMesure = require('../models/PinceMesure');
const Client = require('../models/Client');
const TypeProduit = require('../models/TypeProduit');
const Produit = require('../models/Produit');
const LieuClassement = require('../models/LieuClassement');
const Specification = require('../models/Specification');
const DossierFabrication = require('../models/DossierFabrication');
const Outil = require('../models/Outil');
const Composant = require('../models/Composant');
const Operation = require('../models/Operation');
const Ressource = require('../models/Ressource');
const Fabrication = require('../models/Fabrication');
const Indicateur = require('../models/Indicateur');

async function seed() {
  console.log('[SEED] Connexion...');
  await connectDB();

  const models = [
    User, Zone, Fabricant, Modele, Categorie, Equipement, TacheMaintenance,
    Intervention, TempsArret, Ecme, EcmeVerification, Pince, Mors, MorsPosition,
    Cosse, Fil, CosseFil, ConfigurationSertissage, PinceMesure, Client, TypeProduit,
    Produit, LieuClassement, Specification, DossierFabrication, Outil, Composant,
    Operation, Ressource, Fabrication, Indicateur,
  ];
  for (const m of models) {
    await m.collection.drop().catch(() => {});
  }
  console.log('[SEED] Base nettoyée');

  const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

  // ---------- Utilisateurs ----------
  const admin = await User.create({ username: 'admin', fullname: 'Administrateur', email: 'admin@web-rai.local', password: 'admin123', role: 'admin' });
  await User.create({ username: 'maintenance', fullname: 'Technicien Maintenance', email: 'maintenance@web-rai.local', password: 'maint123', role: 'maintenance' });
  await User.create({ username: 'operateur', fullname: 'Opérateur Production', email: 'operateur@web-rai.local', password: 'oper123', role: 'operateur' });
  console.log('[SEED] Utilisateurs : admin/admin123, maintenance/maint123, operateur/oper123');

  // ---------- Inventaire : référentiels ----------
  const zoneBobinage = await Zone.create({ nom_zone: 'Bobinage', localisation: 'Hall A' });
  const zoneCoupe = await Zone.create({ nom_zone: 'Coupe Cable', localisation: 'Hall B' });
  const zoneElec = await Zone.create({ nom_zone: 'Électronique', localisation: 'Hall C' });

  const fabAmada = await Fabricant.create({ nom: 'AMADA', pays: 'Japon', contact: 'contact@amada.com' });
  const fabKomax = await Fabricant.create({ nom: 'KOMAX', pays: 'Suisse', contact: 'support@komax.ch' });
  const fabWeller = await Fabricant.create({ nom: 'WELLER', pays: 'Allemagne', contact: 'info@weller.de' });

  const modele1 = await Modele.create({ fabricant: fabAmada._id, nom: 'ASTRO 100N', description: 'Applicateur de sertissage' });
  const modele2 = await Modele.create({ fabricant: fabKomax._id, nom: 'Zeta 630', description: 'Machine de coupe dénudage' });
  const modele3 = await Modele.create({ fabricant: fabWeller._id, nom: 'WXMP', description: 'Fer à souder' });

  const catApplicateur = await Categorie.create({ nom: 'Applicateur', description: 'Applicateurs de sertissage' });
  const catMachine = await Categorie.create({ nom: 'Machine de coupe', description: 'Machines de coupe et dénudage' });
  const catFer = await Categorie.create({ nom: 'Fer à souder', description: 'Fers à souder' });
  const catPince = await Categorie.create({ nom: 'Pince', description: 'Pinces de sertissage' });

  // ---------- Équipements ----------
  const eq1 = await Equipement.create({ code_rai: 'RAI-0001', designation: 'Applicateur AMADA ASTRO 100N', numero_serie: 'SN-A-1001', date_acquisition: days(-800), statut: 'EN_SERVICE', zone: zoneBobinage._id, fabricant: fabAmada._id, modele: modele1._id, categorie: catApplicateur._id });
  const eq2 = await Equipement.create({ code_rai: 'RAI-0002', designation: 'Machine coupe KOMAX Zeta 630', numero_serie: 'SN-K-2205', date_acquisition: days(-600), statut: 'EN_SERVICE', zone: zoneCoupe._id, fabricant: fabKomax._id, modele: modele2._id, categorie: catMachine._id });
  const eq3 = await Equipement.create({ code_rai: 'RAI-0003', designation: 'Fer à souder WELLER WXMP', numero_serie: 'SN-W-0033', date_acquisition: days(-300), statut: 'HORS_SERVICE', zone: zoneElec._id, fabricant: fabWeller._id, modele: modele3._id, categorie: catFer._id, remarque: 'En attente de réparation' });
  const eq4 = await Equipement.create({ code_rai: 'RAI-0004', designation: 'Pince de sertissage manuelle', numero_serie: 'SN-P-0441', date_acquisition: days(-120), statut: 'EN_SERVICE', zone: zoneBobinage._id, fabricant: fabAmada._id, modele: modele1._id, categorie: catPince._id });

  // ---------- Maintenance ----------
  const tache1 = await TacheMaintenance.create({ categorie: catApplicateur._id, description: 'Nettoyage et graissage des rails', frequence: 'MENSUELLE', temps_estime: 2 });
  const tache2 = await TacheMaintenance.create({ categorie: catMachine._id, description: 'Contrôle des lames de coupe', frequence: 'SEMESTRIELLE', temps_estime: 4 });
  const tache3 = await TacheMaintenance.create({ categorie: catFer._id, description: 'Vérification panne et température', frequence: 'TRIMESTRIELLE', temps_estime: 1 });

  await Intervention.create({ equipement: eq1._id, numero: 'INT-2026-001', type_intervention: 'PREVENTIVE', tache: tache1._id, date: days(-15), temps_reel: 2.5, technicien: 'maintenance', remarque: 'Intervention OK' });
  await Intervention.create({ equipement: eq3._id, numero: 'INT-2026-002', type_intervention: 'CORRECTIVE', date: days(-5), temps_reel: 3, technicien: 'maintenance', remarque: 'Panne électrique détectée' });

  await TempsArret.create({ technicien: 'maintenance', zone: zoneElec._id, equipement: eq3._id, semaine: 'S31-2026', date: days(-5), heure_demande: '08:00', heure_debut: '08:15', heure_fin: '11:15', description: 'Réparation fer à souder', temps_arret: 3 });
  await TempsArret.create({ technicien: 'operateur', zone: zoneCoupe._id, equipement: eq2._id, semaine: 'S31-2026', date: days(-3), heure_demande: '13:00', heure_debut: '13:05', heure_fin: '13:35', description: 'Changement de lame', temps_arret: 0.5 });

  // ---------- ECME ----------
  const ecme1 = await Ecme.create({ code_ecme: 'ECME-001', designation: 'Dynamomètre de force', marque: 'Mecmesin', modele: 'BFG 200N', numero_serie: 'BFG-5001', date_achat: days(-400), date_mise_en_service: days(-390), propriete: 'RAI', verification: 'EXTERNE', affectation: 'Labo Qualité', date_affectation: days(-380), grandeur: 'Force (N)', tolerance: '±1 N' });
  const ecme2 = await Ecme.create({ code_ecme: 'ECME-002', designation: 'Pied à coulisse numérique', marque: 'Mitutoyo', modele: '500-197', numero_serie: 'MTY-2210', date_achat: days(-200), date_mise_en_service: days(-195), propriete: 'RAI', verification: 'INTERNE', affectation: 'Ligne Bobinage', grandeur: 'Longueur (mm)', tolerance: '±0.02 mm' });

  await EcmeVerification.create({ ecme: ecme1._id, date_verification: days(-60), date_prochaine_verification: days(10), statut: 'CONFORME', remarques: 'Conforme aux exigences' });
  await EcmeVerification.create({ ecme: ecme2._id, date_verification: days(-200), date_prochaine_verification: days(-5), statut: 'EN_COURS', remarques: 'Vérification à planifier' });

  // ---------- Outillage : pinces, mors, cosses, fils ----------
  const pince1 = await Pince.create({ numero_pince: 'P-001', designation: 'Pince de sertissage 1' });
  const pince2 = await Pince.create({ numero_pince: 'P-002', designation: 'Pince de sertissage 2' });

  const mors1 = await Mors.create({ reference: 'MORS-A', designation: 'Mors standard' });
  const mors2 = await Mors.create({ reference: 'MORS-B', designation: 'Mors renforcé' });

  await MorsPosition.create({ mors: mors1._id, position: 'P1' });
  await MorsPosition.create({ mors: mors1._id, position: 'P2' });
  await MorsPosition.create({ mors: mors2._id, position: 'P1' });

  const cosse1 = await Cosse.create({ reference: 'COSSE-1.0', designation: 'Cosse diamètre 1.0' });
  const cosse2 = await Cosse.create({ reference: 'COSSE-1.5', designation: 'Cosse diamètre 1.5' });

  const fil1 = await Fil.create({ reference: 'FIL-0.75', section: '0.75 mm²', couleur: 'Rouge' });
  const fil2 = await Fil.create({ reference: 'FIL-1.5', section: '1.5 mm²', couleur: 'Bleu' });

  await CosseFil.create({ cosse: cosse1._id, fil: fil1._id });
  await CosseFil.create({ cosse: cosse2._id, fil: fil2._id });

  const config1 = await ConfigurationSertissage.create({
    pince: pince1._id, mors: mors1._id, position: 'P1', cosse: cosse1._id, fil: fil1._id,
    tenue_traction_minimale: 25,
  });
  const config2 = await ConfigurationSertissage.create({
    pince: pince2._id, mors: mors2._id, position: 'P1', cosse: cosse2._id, fil: fil2._id,
    tenue_traction_minimale: 40,
  });

  // ---------- Mesures de contrôle qualité ----------
  await PinceMesure.create({
    date_mesure: days(-7), pince: pince1._id, mors: mors1._id, position: 'P1', cosse: cosse1._id, fil: fil1._id,
    tenue_traction_minimale: config1.tenue_traction_minimale,
    valeurs: [27, 28, 26, 29, 28, 27], prochaine_date: days(25), statut: 'CONFORME', operateur: 'operateur',
  });
  await PinceMesure.create({
    date_mesure: days(-2), pince: pince2._id, mors: mors2._id, position: 'P1', cosse: cosse2._id, fil: fil2._id,
    tenue_traction_minimale: config2.tenue_traction_minimale,
    valeurs: [41, 42, 40, 38, 41, 42], prochaine_date: days(-1), statut: 'NON_CONFORME', operateur: 'operateur', remarque: 'Valeur 4 sous le minimum',
  });

  // ---------- Dossiers de méthodes ----------
  const client1 = await Client.create({ nom: 'Client Alpha', adresse: 'Paris', contact: 'contact@alpha.fr' });
  const client2 = await Client.create({ nom: 'Client Beta', adresse: 'Lyon', contact: 'achats@beta.fr' });

  const typeHarnais = await TypeProduit.create({ designation: 'Harnais électrique' });
  const typeFaisceau = await TypeProduit.create({ designation: 'Faisceau moteur' });

  const produit1 = await Produit.create({ reference: 'PROD-A1', indice: 'A', type_produit: typeHarnais._id, client: client1._id, designation: 'Harnais tableau de bord' });
  const produit2 = await Produit.create({ reference: 'PROD-B2', indice: 'B', type_produit: typeFaisceau._id, client: client2._id, designation: 'Faisceau moteur avant' });

  const lieu1 = await LieuClassement.create({ lieu: 'Armoire M1' });
  const lieu2 = await LieuClassement.create({ lieu: 'Armoire M2' });

  await Specification.create({ reference: 'SPEC-100', designation: 'Spécification sertissage', indice: 'A', date_reception: days(-100), client: client1._id, lieu_classement: lieu1._id, nombre_copies: 2 });
  await Specification.create({ reference: 'SPEC-200', designation: 'Spécification coupe', indice: 'B', date_reception: days(-50), client: client2._id, lieu_classement: lieu2._id, nombre_copies: 1 });

  await DossierFabrication.create({ ref_produit: produit1._id, designation: 'Dossier fabrication harnais A1', client: client1._id, type_produit: typeHarnais._id, lieu_classement: lieu1._id, nombre_copies: 3 });
  await DossierFabrication.create({ ref_produit: produit2._id, designation: 'Dossier fabrication faisceau B2', client: client2._id, type_produit: typeFaisceau._id, lieu_classement: lieu2._id, nombre_copies: 2 });

  // ---------- Workflow ----------
  const outil1 = await Outil.create({ nom: 'Pince à sertir', reference: 'OUT-001' });
  const outil2 = await Outil.create({ nom: 'Dénudeur automatique', reference: 'OUT-002' });

  const composant1 = await Composant.create({ reference: 'CMP-100', designation: 'Connecteur 12 broches' });
  const composant2 = await Composant.create({ reference: 'CMP-200', designation: 'Gaine thermorétractable' });

  const ressource1 = await Ressource.create({ titre: 'Notice de sertissage', type: 'PDF', url: '', description: 'Notice de la pince P-001', uploader: 'admin' });

  const operation1 = await Operation.create({ code: 'OP-010', libelle: 'Dénudage', ordre: 10, equipement: eq2._id, outils: [outil2._id], parametres: 'Longueur dénudage 12mm', ressources: [ressource1._id] });
  const operation2 = await Operation.create({ code: 'OP-020', libelle: 'Sertissage', ordre: 20, equipement: eq1._id, outils: [outil1._id], parametres: 'Force de sertissage 28N', ressources: [] });

  await Fabrication.create({ code_processus: 'FAB-PA1', dossier: undefined, produit: produit1._id, indice: 'A', operations: [operation1._id, operation2._id], ressources: [ressource1._id], description: 'Processus de fabrication harnais A1', statut: 'VALIDE' });

  // ---------- Indicateurs ----------
  await Indicateur.create({ code: 'KPI-M01', libelle: 'Taux de conformité sertissage', categorie: 'QUALITE', unite: '%', cible: 98, valeur: 96.5, periode: 'S31-2026', commentaire: 'Objectif atteint' });
  await Indicateur.create({ code: 'KPI-I02', libelle: 'Temps de cycle moyen', categorie: 'INDUSTRIALISATION', unite: 'min', cible: 5, valeur: 5.4, periode: 'S31-2026', commentaire: '' });

  console.log('[SEED] Données de démonstration insérées avec succès.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[SEED] Erreur :', err);
  process.exit(1);
});