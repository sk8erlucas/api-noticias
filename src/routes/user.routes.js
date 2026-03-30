const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ─── LEER MÁS TARDE ──────────────────────────────────────────────────────────

// GET /api/user/leer-mas-tarde — Listar noticias guardadas para leer más tarde
router.get('/leer-mas-tarde', async (req, res, next) => {
  try {
    const items = await prisma.leerMasTarde.findMany({
      where: { usuarioId: req.usuario.id },
      orderBy: { createdAt: 'desc' },
      include: {
        noticia: {
          select: {
            id: true,
            titulo: true,
            link: true,
            resumen: true,
            impacto: true,
            sentimiento: true,
            fuente: true,
            pais: true,
            publicadoEn: true,
          },
        },
      },
    });

    return res.json({
      total: items.length,
      noticias: items.map((i) => ({ ...i.noticia, guardadoEn: i.createdAt })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/user/leer-mas-tarde/:noticiaId — Agregar a leer más tarde
router.post('/leer-mas-tarde/:noticiaId', async (req, res, next) => {
  try {
    const noticiaId = parseInt(req.params.noticiaId);
    if (isNaN(noticiaId)) {
      return res.status(400).json({ error: 'noticiaId inválido.' });
    }

    const noticia = await prisma.noticia.findUnique({ where: { id: noticiaId }, select: { id: true } });
    if (!noticia) {
      return res.status(404).json({ error: 'Noticia no encontrada.' });
    }

    const item = await prisma.leerMasTarde.upsert({
      where: { usuarioId_noticiaId: { usuarioId: req.usuario.id, noticiaId } },
      create: { usuarioId: req.usuario.id, noticiaId },
      update: {},
    });

    return res.status(201).json({ mensaje: 'Noticia agregada a leer más tarde.', id: item.id });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/user/leer-mas-tarde/:noticiaId — Quitar de leer más tarde
router.delete('/leer-mas-tarde/:noticiaId', async (req, res, next) => {
  try {
    const noticiaId = parseInt(req.params.noticiaId);
    if (isNaN(noticiaId)) {
      return res.status(400).json({ error: 'noticiaId inválido.' });
    }

    await prisma.leerMasTarde.deleteMany({
      where: { usuarioId: req.usuario.id, noticiaId },
    });

    return res.json({ mensaje: 'Noticia eliminada de leer más tarde.' });
  } catch (err) {
    next(err);
  }
});

// ─── FAVORITOS ────────────────────────────────────────────────────────────────

// GET /api/user/favoritos — Listar noticias favoritas
router.get('/favoritos', async (req, res, next) => {
  try {
    const items = await prisma.favorito.findMany({
      where: { usuarioId: req.usuario.id },
      orderBy: { createdAt: 'desc' },
      include: {
        noticia: {
          select: {
            id: true,
            titulo: true,
            link: true,
            resumen: true,
            impacto: true,
            sentimiento: true,
            fuente: true,
            pais: true,
            publicadoEn: true,
          },
        },
      },
    });

    return res.json({
      total: items.length,
      noticias: items.map((i) => ({ ...i.noticia, guardadoEn: i.createdAt })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/user/favoritos/:noticiaId — Agregar a favoritos
router.post('/favoritos/:noticiaId', async (req, res, next) => {
  try {
    const noticiaId = parseInt(req.params.noticiaId);
    if (isNaN(noticiaId)) {
      return res.status(400).json({ error: 'noticiaId inválido.' });
    }

    const noticia = await prisma.noticia.findUnique({ where: { id: noticiaId }, select: { id: true } });
    if (!noticia) {
      return res.status(404).json({ error: 'Noticia no encontrada.' });
    }

    const item = await prisma.favorito.upsert({
      where: { usuarioId_noticiaId: { usuarioId: req.usuario.id, noticiaId } },
      create: { usuarioId: req.usuario.id, noticiaId },
      update: {},
    });

    return res.status(201).json({ mensaje: 'Noticia agregada a favoritos.', id: item.id });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/user/favoritos/:noticiaId — Quitar de favoritos
router.delete('/favoritos/:noticiaId', async (req, res, next) => {
  try {
    const noticiaId = parseInt(req.params.noticiaId);
    if (isNaN(noticiaId)) {
      return res.status(400).json({ error: 'noticiaId inválido.' });
    }

    await prisma.favorito.deleteMany({
      where: { usuarioId: req.usuario.id, noticiaId },
    });

    return res.json({ mensaje: 'Noticia eliminada de favoritos.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
