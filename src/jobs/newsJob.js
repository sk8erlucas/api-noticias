const cron = require('node-cron');
const { processNews } = require('../services/newsService');

/**
 * Registra el cron job que procesa noticias cada 4 horas (hora Argentina).
 */
function startNewsJob() {
  cron.schedule(
    '0 */4 * * *',
    async () => {
      console.log('[CronJob] Ejecutando procesamiento de noticias cada 4 horas...');
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

  console.log('[CronJob] Programado para ejecutarse cada 4 horas (America/Argentina/Buenos_Aires)');
}

module.exports = { startNewsJob };
