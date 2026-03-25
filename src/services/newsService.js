const prisma = require('../lib/prisma');
const { parseFeed } = require('./rssService');
const { scrapeArticle } = require('./scraperService');
const { analyzeNews } = require('./aiService');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Procesa todos los feeds activos: obtiene noticias nuevas, las scrapea y las analiza con IA.
 * @returns {Promise<{procesadas: number, omitidas: number, errores: number}>}
 */
async function processNews() {
  console.log('[NewsService] Iniciando procesamiento de noticias...');

  const feeds = await prisma.feed.findMany({ where: { activo: true } });

  if (feeds.length === 0) {
    console.log('[NewsService] No hay feeds activos configurados.');
    return { procesadas: 0, omitidas: 0, errores: 0 };
  }

  let procesadas = 0;
  let omitidas = 0;
  let errores = 0;

  for (const feed of feeds) {
    console.log(`[NewsService] Procesando feed: ${feed.nombre} (${feed.url})`);

    let items;
    try {
      items = await parseFeed(feed.url);
    } catch (feedError) {
      console.error(`[NewsService] Error leyendo feed ${feed.url}:`, feedError.message);
      errores++;
      continue;
    }

    for (const item of items) {
      // Ignorar items sin link
      if (!item.link) {
        errores++;
        continue;
      }

      try {
        // Verificar si la noticia ya existe (deduplicación por link)
        const exists = await prisma.noticia.findUnique({ where: { link: item.link } });
        if (exists) {
          omitidas++;
          continue;
        }

        console.log(`[NewsService] Nueva noticia: ${item.titulo}`);

        // Scrapear contenido del artículo con delay respetuoso
        await sleep(1500);
        let contenido = '';
        try {
          contenido = await scrapeArticle(item.link);
        } catch (scrapeError) {
          console.warn(`[NewsService] Scraping fallido para ${item.link}: ${scrapeError.message}`);
          contenido = item.descripcion || '';
        }

        // Analizar con IA (delay adicional para respetar rate limits)
        await sleep(1000);
        let analisis = null;
        try {
          const textoParaAnalizar = contenido || item.descripcion || item.titulo;
          analisis = await analyzeNews(item.titulo, textoParaAnalizar);
        } catch (aiError) {
          console.warn(`[NewsService] Análisis IA fallido: ${aiError.message}`);
        }

        // Guardar en la base de datos
        await prisma.noticia.create({
          data: {
            titulo: item.titulo,
            link: item.link,
            descripcion: item.descripcion || null,
            contenido: contenido || null,
            fuente: item.fuente || null,
            publicadoEn: item.publicadoEn || null,
            procesadoEn: new Date(),
            resumen: analisis?.resumen || null,
            impacto: analisis?.impacto || null,
            sentimiento: analisis?.sentimiento || null,
            razonImpacto: analisis?.razon_impacto || null,
            razonSentimiento: analisis?.razon_sentimiento || null,
          },
        });

        procesadas++;
        console.log(`[NewsService] ✓ Guardada: ${item.titulo}`);
      } catch (itemError) {
        console.error(`[NewsService] Error procesando ${item.link}:`, itemError.message);
        errores++;
      }
    }
  }

  const resultado = { procesadas, omitidas, errores };
  console.log(`[NewsService] Finalizado →`, resultado);
  return resultado;
}

module.exports = { processNews };
