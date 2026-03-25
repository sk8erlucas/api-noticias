const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/feeds — Listar todos los feeds
router.get('/', async (req, res, next) => {
  try {
    const feeds = await prisma.feed.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(feeds);
  } catch (err) {
    next(err);
  }
});

// POST /api/feeds — Agregar un nuevo feed RSS
router.post('/', async (req, res, next) => {
  try {
    const { nombre, url } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ error: 'nombre es requerido' });
    }
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({ error: 'url es requerida' });
    }

    // Validar que sea una URL bien formada
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Protocolo no permitido');
      }
    } catch {
      return res.status(400).json({ error: 'URL inválida, debe comenzar con http:// o https://' });
    }

    const feed = await prisma.feed.create({
      data: { nombre: nombre.trim(), url: url.trim() },
    });

    res.status(201).json(feed);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un feed con esa URL' });
    }
    next(err);
  }
});

// PUT /api/feeds/:id — Actualizar nombre, url o estado activo
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const { nombre, url, activo } = req.body;
    const data = {};

    if (nombre !== undefined) data.nombre = String(nombre).trim();
    if (activo !== undefined) data.activo = Boolean(activo);
    if (url !== undefined) {
      try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
        data.url = url.trim();
      } catch {
        return res.status(400).json({ error: 'URL inválida' });
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Debe proveer al menos un campo para actualizar' });
    }

    const feed = await prisma.feed.update({ where: { id }, data });
    res.json(feed);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Feed no encontrado' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ya existe un feed con esa URL' });
    next(err);
  }
});

// DELETE /api/feeds/:id — Eliminar feed
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    await prisma.feed.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Feed no encontrado' });
    next(err);
  }
});

module.exports = router;
