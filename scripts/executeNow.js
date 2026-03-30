require('dotenv').config();
const prisma = require('../src/lib/prisma');
const { processNews } = require('../src/services/newsService');

async function main() {
  // Feeds activos. Cambiar una URL aquí desactiva la anterior automáticamente.
  const feeds = [
    { nombre: 'Perfil - Economía', url: 'https://www.perfil.com/feed/economia', pais: 'AR' },
    { nombre: 'Ambito - Finanzas', url: 'https://www.ambito.com/rss/pages/finanzas.xml', pais: 'AR' },
    { nombre: 'El Confidencial - Economía', url: 'https://rss.elconfidencial.com/economia/', pais: 'ES' },
  ];

  const activeUrls = feeds.map((f) => f.url);

  // Desactivar feeds que ya no están en la lista (ej: URLs que dieron 403)
  await prisma.feed.updateMany({
    where: { url: { notIn: activeUrls }, activo: true },
    data: { activo: false },
  });

  for (const feed of feeds) {
    await prisma.feed.upsert({
      where: { url: feed.url },
      update: { nombre: feed.nombre, pais: feed.pais, activo: true },
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
