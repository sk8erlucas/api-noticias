const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiter general: 500 peticiones cada 15 minutos por IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Intentá de nuevo más tarde.' },
});

// Rate limiter específico para GET /api/noticias: 300 peticiones cada 15 minutos por IP
const noticiasLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones al endpoint de noticias. Intentá de nuevo más tarde.' },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit global
app.use(generalLimiter);

// Archivos estáticos (panel HTML)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rutas
app.use('/api/noticias', noticiasLimiter, require('./routes/news.routes'));
app.use('/api/feeds', require('./routes/feed.routes'));
app.use('/api/jobs', require('./routes/job.routes'));


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 genérico
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores
app.use(require('./middlewares/errorHandler'));

module.exports = app;
