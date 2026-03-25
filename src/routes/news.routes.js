const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

const SENTIMIENTOS_VALIDOS = ['POSITIVO', 'NEGATIVO', 'NEUTRO'];
const IMPACTOS_VALIDOS = ['FUERTE', 'MODERADO', 'DEBIL'];

// GET /api/noticias — Listar noticias con paginación y filtros
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sentimiento, impacto, fuente } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (sentimiento) {
      const s = sentimiento.toUpperCase();
      if (!SENTIMIENTOS_VALIDOS.includes(s)) {
        return res.status(400).json({ error: `sentimiento debe ser uno de: ${SENTIMIENTOS_VALIDOS.join(', ')}` });
      }
      where.sentimiento = s;
    }
    if (impacto) {
      const i = impacto.toUpperCase();
      if (!IMPACTOS_VALIDOS.includes(i)) {
        return res.status(400).json({ error: `impacto debe ser uno de: ${IMPACTOS_VALIDOS.join(', ')}` });
      }
      where.impacto = i;
    }
    if (fuente) {
      where.fuente = { contains: fuente, mode: 'insensitive' };
    }

    const [noticias, total] = await Promise.all([
      prisma.noticia.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { publicadoEn: 'desc' },
        select: {
          id: true,
          titulo: true,
          link: true,
          resumen: true,
          impacto: true,
          sentimiento: true,
          razonImpacto: true,
          razonSentimiento: true,
          fuente: true,
          publicadoEn: true,
          procesadoEn: true,
          createdAt: true,
        },
      }),
      prisma.noticia.count({ where }),
    ]);

    res.json({
      data: noticias,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/noticias/:id — Obtener noticia por ID (incluye contenido completo)
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const noticia = await prisma.noticia.findUnique({ where: { id } });
    if (!noticia) return res.status(404).json({ error: 'Noticia no encontrada' });

    res.json(noticia);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/noticias/:id — Eliminar noticia
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    await prisma.noticia.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Noticia no encontrada' });
    next(err);
  }
});

module.exports = router;
