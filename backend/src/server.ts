import { createApp } from '@/app';
import { env } from '@/config/env';
import { disconnectDatabase } from '@/core/database/prisma';
import { logger } from '@/core/logger';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = createApp().listen(env.PORT, () => {
  logger.info(`Application running on: http://localhost:${env.PORT}/health`);
});

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'server.shutting_down');

  const force = setTimeout(() => {
    logger.error('server.shutdown_timeout');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  force.unref();

  try {
    // Ngừng nhận request mới, chờ request đang chạy xong, rồi đóng kết nối database
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
    await disconnectDatabase();
    logger.info('server.stopped');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'server.shutdown_failed');
    process.exit(1);
  }
}

process.on('SIGTERM', (signal) => void shutdown(signal));
process.on('SIGINT', (signal) => void shutdown(signal));
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'process.unhandled_rejection');
});
