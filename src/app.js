const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/noticias', require('./routes/news.routes'));
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
