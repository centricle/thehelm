import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dashboardRoutes from './routes/dashboard.js';
import deploysApi from './routes/api/deploys.js';
import statusApi from './routes/api/status.js';
import projectsApi from './routes/api/projects.js';
import gitApi from './routes/api/git.js';
import streamApi from './routes/api/stream.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 7040;

// EJS setup
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Static files
app.use(express.static(join(__dirname, 'public')));

// Make demo mode available to all templates
app.use((req, res, next) => {
  res.locals.isDemoMode = process.env.DEMO_MODE === 'true';
  next();
});

// Shared template helpers
app.locals.formatRelative = function (dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + 'd ago';
  const months = Math.floor(days / 30);
  return months + 'mo ago';
};

app.locals.stalenessClass = function (dateStr) {
  if (!dateStr) return 'text-fg-faint';
  const days = (Date.now() - new Date(dateStr).getTime()) / 86400000;
  if (days < 7) return 'staleness-fresh';
  if (days < 30) return 'staleness-aging';
  return 'staleness-stale';
};

// Routes
app.use('/', dashboardRoutes);
app.use('/api/deploys', deploysApi);
app.use('/api/status', statusApi);
app.use('/api/projects', projectsApi);
app.use('/api/git', gitApi);
app.use('/api/stream', streamApi);

// 404 handler
app.use((req, res) => {
  res.status(404).send('Not found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = Number.isInteger(err.status) ? err.status : 500;
  res.status(status).send('Internal server error');
});

app.listen(PORT, () => {
  const mode = process.env.DEMO_MODE === 'true' ? 'demo' : 'live';
  console.log(`thehelm running on http://localhost:${PORT} (${mode} mode)`);
});
