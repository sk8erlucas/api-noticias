const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'author'],
    ],
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
  },
  timeout: 15000,
});

/**
 * Parsea un feed RSS/Atom y devuelve los items normalizados.
 * @param {string} url - URL del feed RSS
 * @returns {Promise<Array>}
 */
async function parseFeed(url) {
  const feed = await parser.parseURL(url);

  return feed.items.map((item) => ({
    titulo: item.title?.trim() || '',
    link: item.link?.trim() || '',
    descripcion: item.contentSnippet || item.summary || '',
    fuente: feed.title || url,
    publicadoEn: item.pubDate ? new Date(item.pubDate) : null,
  }));
}

module.exports = { parseFeed };
