const cron = require('node-cron');
const { processNews } = require('../services/newsService');

/**
 * Registra el cron job que procesa noticias cada 24 horas a las 00:00 (hora Argentina).
 */
function startNewsJob() {
  cron.schedule(
    '0 0 * * *',
    async () => {
      console.log('[CronJob] Ejecutando procesamiento diario de noticias...');
      try {
        const resultado = await processNews();
        console.log('[CronJob] Completado:', resultado);
      } catch (err) {
        console.error('[CronJob] Error inesperado:', err);
      }
    },
    {
      timezone: 'America/Argentina/Buenos_Aires',
    }
  );

  console.log('[CronJob] Programado para ejecutarse a las 00:00 (America/Argentina/Buenos_Aires)');
}

module.exports = { startNewsJob };
