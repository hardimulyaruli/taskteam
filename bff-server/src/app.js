const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

const authRoutes       = require('./routes/auth.routes');
const dashboardRoutes  = require('./routes/dashboard.routes');
const taskRoutes       = require('./routes/task.routes');
const submissionRoutes = require('./routes/submission.routes');
const commentRoutes    = require('./routes/comment.routes');
const adminRoutes      = require('./routes/admin.routes');

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use(express.json());

// ── Request logger ──
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const logLine = `[${new Date().toISOString()}] [${req.method}] ${req.originalUrl} → ${res.statusCode} (${ms}ms) Auth: ${req.headers.authorization ? 'Present' : 'None'}\n`;
    console.log(logLine.trim());
    try {
      fs.appendFileSync(path.join(__dirname, '../bff-requests.log'), logLine);
    } catch (e) {
      // ignore
    }
  });
  next();
});

// ── CORS ──
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Static file serving untuk uploads ──
// Hanya untuk serve preview (bukan download langsung tanpa auth)
// Download yang proper tetap lewat endpoint /submissions/:subId/download
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Serve foto profil secara publik (untuk ditampilkan di <img>)
const AVATAR_DIR = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });
app.use('/uploads/avatars', express.static(AVATAR_DIR));

// ── Routes ──
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/health', (_req, res) => res.json({ status: 'OK' }));
app.use('/auth',      authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/tasks',     taskRoutes);
app.use('/',          submissionRoutes);
app.use('/',          commentRoutes);
app.use('/admin',     adminRoutes);

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error('[UnhandledError]', err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
});

module.exports = app;