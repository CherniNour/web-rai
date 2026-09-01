require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const inventaireRoutes = require('./routes/inventaire.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const ecmeRoutes = require('./routes/ecme.routes');
const outillageRoutes = require('./routes/outillage.routes');
const mesuresRoutes = require('./routes/mesures.routes');
const methodesRoutes = require('./routes/methodes.routes');
const workflowRoutes = require('./routes/workflow.routes');
const indicateurRoutes = require('./routes/indicateurs.routes');
const reportingRoutes = require('./routes/reporting.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'WEB-RAI API' }));

app.use('/api/auth', authRoutes);
app.use('/api/inventaire', inventaireRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/ecme', ecmeRoutes);
app.use('/api/outillage', outillageRoutes);
app.use('/api/mesures', mesuresRoutes);
app.use('/api/methodes', methodesRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/indicateurs', indicateurRoutes);
app.use('/api/reporting', reportingRoutes);

const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^\/(?!api|uploads).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  console.log('[STATIC] Frontend servi depuis', frontendDist);
}

app.use((req, res) => res.status(404).json({ message: 'Route introuvable' }));

app.use((err, _req, res, _next) => {
  console.error('[ERREUR]', err.message);
  res.status(500).json({ message: err.message || 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[SERVER] WEB-RAI API démarré sur http://localhost:${PORT}`);
  });
});
