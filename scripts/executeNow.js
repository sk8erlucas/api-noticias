require('dotenv').config();
const prisma = require('../src/lib/prisma');
const { processNews } = require('../src/services/newsService');

async function main() {
  // Asegurar que el feed de Perfil esté cargado
  await prisma.feed.upsert({
    where: { url: 'https://www.perfil.com/feed/economia' },
    update: {},
    create: {
      nombre: 'Perfil - Economía',
      url: 'https://www.perfil.com/feed/economia',
      activo: true,
    },
  });

  const resultado = await processNews();
  console.log('\nResultado final:', resultado);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
