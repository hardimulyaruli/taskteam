const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (req, res) => res.json({ status: 'OK' }));
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error('[UnhandledError]', err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
});

module.exports = app;
