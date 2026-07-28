import server from './server.js';
import { env } from '@/shared/config/env';
import { logger } from '@/shared/logger';
server.listen(env.PORT, () => {
  logger.info(`🚀 Miio Backend running on port ${env.PORT}`);
});
server.on('error', (error) => {
  logger.fatal(error, 'Failed to start server');
  process.exit(1);
});
const shutdown = (signal: NodeJS.Signals) => {
  logger.info(`${signal} received. Shutting down...`);

  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));