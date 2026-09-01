# WEB-RAI - Application Web de Gestion Production & Méthodes

Application web sécurisée et centralisée remplaçant les fichiers Excel (FQ030, FQ031, FQ024, fiches de vie ECME, etc.) : source unique de vérité pour l'inventaire, le statut, la localisation et l'historique de maintenance des équipements de production, la gestion des ECME, des outillages spécifiques, des dossiers de méthodes, des workflows de fabrication et des indicateurs méthode-industrialisation.

## Stack technique

| Couche     | Technologie                                   |
| ---------- | --------------------------------------------- |
| Frontend   | HTML, CSS, React.js (Vite + React Router)     |
| Backend    | Node.js + Express                             |
| Base de données | MongoDB (Mongoose) - *local sur `mongodb://127.0.0.1:27017/web_rai`* |

## Prérequis

- Node.js 18+ (testé avec v20)
- MongoDB Community Server installé et démarré (service `MongoDB` sur le port 27017)

## Installation

### 1. Base de données

MongoDB doit être démarré. Vérifier :

```powershell
Get-Service MongoDB   # Status: Running
```

### 2. Backend

```powershell
cd backend
npm install
npm run seed          # Charge les données de démonstration + comptes utilisateurs
npm start             # API sur http://localhost:5000
```

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev           # Dev server sur http://localhost:5173 (proxy API -> :5000)
```

### Mode production (1 seul port)

```powershell
cd frontend
npm run build         # Génère dist/
cd ..\backend
npm start             # L'application complète est servie sur http://localhost:5000
```

## Comptes de démonstration (créés par le seed)

| Rôle               | Identifiant  | Mot de passe | Droits                                             |
| ------------------ | ------------ | ------------ | -------------------------------------------------- |
| Administrateur     | admin        | admin123     | Tous droits (référentiels, utilisateurs, tout CRUD) |
| Maintenance/Qualité| maintenance  | maint123     | Interventions, contrôles, tâches, ECME, outillages  |
| Opérateur          | operateur    | oper123      | Consultation inventaire + mise à jour du statut     |

## Modules couverts (cahier des charges)

1. **Inventaire** – Référentiels (Zones, Fabricants, Modèles, Catégories), Équipements (CRUD, recherche, tri), sommaire graphique par statut et par zone.
2. **Maintenance** – Tâches par catégorie et fréquence, journal des interventions, suivi des temps d'arrêt, calendrier des interventions par zone.
3. **ECME** – Référentiel, enregistrement des vérifications, état des ECME (OK / échéance 30 j / échue / à vérifier).
4. **Outillages spécifiques** – Pinces, Mors, Mors/Positions, Cosses, Fils, configurations Cosse/Fil, règles de sertissage (Pince/Mors/Position/Cosse/Fil + tenue min).
5. **Mesures de contrôle qualité** – Journal des mesures de force d'extraction des pinces (basé sur les configurations, calcul automatique du statut Conforme/Non conforme).
6. **Dossiers de méthodes** – Clients, Types de produits, Produits, Lieux de classement, Spécifications, Dossiers de fabrication.
7. **Workflows de fabrication** – Outils, Composants, Opérations, Ressources descriptives (upload notes/PDF/vidéos), Processus de fabrication (validation, ressources liées).
8. **Indicateurs méthode-industrialisation** – KPIs (code, catégorie, cible, valeur, période, avancement).
9. **Reporting et rappels** – Synthèse globale (total, OK/NOK, % défaillance), statut par zone, alertes de contrôle échues/30 jours, rapport historique exportable CSV.
10. **Sécurité & rôles** – Authentification JWT, rôles Opérateur / Maintenance / Admin, interface responsive (mobile/tablette).

## Structure du projet

```
├── backend/
│   ├── src/
│   │   ├── config/db.js            # Connexion MongoDB
│   │   ├── middleware/             # auth JWT + vérification des rôles
│   │   ├── models/                 # 32 modèles Mongoose
│   │   ├── routes/                 # API REST par module
│   │   ├── scripts/seed.js         # Données de démonstration
│   │   └── server.js               # Serveur Express
│   └── uploads/                    # Fichiers ressources (PDF, vidéos...)
└── frontend/
    └── src/
        ├── components/             # Layout, DataTable, CrudPage, Modal, hooks...
        ├── context/AuthContext.jsx # Authentification + rôles
        └── pages/                  # Une page par module
```

## API principale

| Méthode | Endpoint                                  | Description                          |
| ------- | ----------------------------------------- | ------------------------------------ |
| POST    | `/api/auth/login`                         | Connexion (JWT)                      |
| GET     | `/api/inventaire/sommaire`                | Sommaire par statut et zone          |
| PUT     | `/api/inventaire/equipements/:id/statut`  | Changer le statut (tous les rôles)   |
| GET     | `/api/reporting/synthese`                 | Indicateurs globaux + alertes        |
| GET     | `/api/reporting/historique?export=csv`    | Rapport historique exportable        |
| ...     | CRUD `/api/<module>`                      | Gestion de chaque module             |

Toutes les routes CRUD sont accessibles sur `/api/inventaire`, `/api/maintenance`, `/api/ecme`, `/api/outillage`, `/api/mesures`, `/api/methodes`, `/api/workflow`, `/api/indicateurs`, `/api/reporting`.

## Migration des données Excel (ENF-TECH.03)

Le script `backend/src/scripts/seed.js` charge les données de référence de démonstration. Pour migrer vos fichiers Excel existants, adaptez ce script en lisant vos CSV (module `csv-parse`) puis en les insérant avec les mêmes modèles Mongoose (un champ de chaque fichier FQ030, FQ024, etc. correspond aux champs des modèles décrits dans le cahier des charges).

## Notes de sécurité

- Le secret JWT (`JWT_SECRET`) et la chaîne MongoDB (`MONGODB_URI`) sont configurables dans `backend/.env` — **modifiez le secret en production**.
- Les mots de passe sont hachés avec bcrypt.
- Les rôles limitent l'accès : un opérateur ne peut ni créer ni supprimer d'équipements, ni gérer les référentiels.
