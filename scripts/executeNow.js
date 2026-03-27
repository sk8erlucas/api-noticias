require('dotenv').config();
const prisma = require('../src/lib/prisma');
const { processNews } = require('../src/services/newsService');

async function main() {
  // Asegurar que los feeds estén cargados
  const feeds = [
    { nombre: 'Perfil - Economía', url: 'https://www.perfil.com/feed/economia', pais: 'AR' },
    { nombre: 'Ambito - Finanzas', url: 'https://www.ambito.com/rss/pages/finanzas.xml', pais: 'AR' },
    { nombre: 'El Economista', url: 'https://www.eleconomista.es/rss/rss-seleccion-ee.php', pais: 'ES' },
  ];

  for (const feed of feeds) {
    await prisma.feed.upsert({
      where: { url: feed.url },
      update: { pais: feed.pais },
      create: { nombre: feed.nombre, url: feed.url, activo: true, pais: feed.pais },
    });
  }

  const resultado = await processNews();
  console.log('\nResultado final:', resultado);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
