import { app } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './config/logger';
import { SettingsService } from './modules/billing/settings/settings.service';

const PORT = env.PORT || 3000;

async function startServer() {
  try {
    // 1. Connect to MySQL
    await connectDatabase();

    // 2. Initialize default gym settings if needed
    try {
      await SettingsService.initializeDefaults();
    } catch (e) {
      logger.warn('Could not initialize default settings:', e);
    }

    // 3. Start listening
    const server = app.listen(PORT, () => {
      logger.info(`🚀 RV Fitness Billing API is running on port ${PORT}`);
      logger.info(`🌐 Environment: ${env.NODE_ENV}`);
      logger.info(`📋 API Health: http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Initiating graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown after 10s if connections don't drain
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
