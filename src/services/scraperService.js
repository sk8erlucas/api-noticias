const axios = require('axios');
const cheerio = require('cheerio');

// Selectores CSS ordenados por especificidad para extraer el cuerpo del artículo
const ARTICLE_SELECTORS = [
  '.article-body',
  '.entry-content',
  '.post-content',
  '.content-nota',
  '.nota-content',
  '.td-post-content',
  '[class*="article-body"]',
  '[class*="entry-content"]',
  '[class*="post-body"]',
  'article',
  'main',
];

// Elementos a eliminar antes de extraer el texto
const ELEMENTS_TO_REMOVE = [
  'script',
  'style',
  'nav',
  'header',
  'footer',
  'aside',
  'figure',
  'figcaption',
  '.ads',
  '.publicidad',
  '.related-news',
  '.recomendados',
  '.compartir',
  '.tags',
  '.comments',
  '[class*="social"]',
  '[class*="newsletter"]',
  '[class*="banner"]',
  '[class*="relacionad"]',
];

/**
 * Scrapea el contenido de texto de un artículo a partir de su URL.
 * @param {string} url
 * @returns {Promise<string>}
 */
async function scrapeArticle(url) {
  const response = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-AR,es;q=0.9',
    },
    timeout: 20000,
    maxRedirects: 5,
  });

  const $ = cheerio.load(response.data);

  // Eliminar elementos no deseados
  ELEMENTS_TO_REMOVE.forEach((sel) => $(sel).remove());

  let content = '';

  // Intentar con selectores específicos primero
  for (const selector of ARTICLE_SELECTORS) {
    const el = $(selector).first();
    if (el.length) {
      const paragraphs = el
        .find('p')
        .map((_, p) => $(p).text().trim())
        .get()
        .filter((t) => t.length > 30);

      const candidate = paragraphs.join('\n\n');
      if (candidate.length > 200) {
        content = candidate;
        break;
      }
    }
  }

  // Fallback: todos los párrafos significativos de la página
  if (content.length < 200) {
    content = $('p')
      .map((_, p) => $(p).text().trim())
      .get()
      .filter((t) => t.length > 50)
      .join('\n\n');
  }

  // Limitar a 5000 caracteres para no saturar el modelo de IA
  return content.substring(0, 5000).trim();
}

module.exports = { scrapeArticle };
