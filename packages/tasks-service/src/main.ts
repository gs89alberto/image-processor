import logger from 'common/src/utils/logger';
import config from 'common/src/config/config';
import { connectDB } from 'common/src/config/db';
import { createHttpServer } from './infrastructure/interface/http/server';

async function start() {
  await connectDB();

  const app = createHttpServer();
  const port = config.get('PORT') || 3000;

  app.listen(port, () => {
    logger.info(`[${config.get('SERVICE_NAME')}] Server running on port ${port}`);
  });
}

start().catch((err) => {
  logger.error(`[${config.get('SERVICE_NAME')}] Failed to start:`, err);
});
