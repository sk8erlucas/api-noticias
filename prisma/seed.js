const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Feed inicial: Perfil - Economía
  await prisma.feed.upsert({
    where: { url: 'https://www.perfil.com/feed/economia' },
    update: {},
    create: {
      nombre: 'Perfil - Economía',
      url: 'https://www.perfil.com/feed/economia',
      activo: true,
    },
  });

  console.log('[Seed] Feed inicial cargado correctamente.');
}

main()
  .catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
