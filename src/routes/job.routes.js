const express = require('express');
const router = express.Router();
const { processNews } = require('../services/newsService');

// POST /api/jobs/ejecutar — Disparar manualmente el procesamiento de noticias
router.post('/ejecutar', async (req, res, next) => {
  try {
    // Responder inmediatamente y procesar en background
    res.json({ mensaje: 'Procesamiento iniciado en background', estado: 'procesando' });

    processNews()
      .then((resultado) => console.log('[JobRoute] Procesamiento completado:', resultado))
      .catch((err) => console.error('[JobRoute] Error en procesamiento:', err));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
