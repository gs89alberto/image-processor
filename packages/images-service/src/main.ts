import config from 'common/src/config/config';
import logger from 'common/src/utils/logger';
import { connectDB } from 'common/src/config/db';

async function start() {
  await connectDB();

  logger.info(`[${config.get('SERVICE_NAME')}] running...`);
}

start().catch((err) => {
  logger.error(`[${config.get('SERVICE_NAME')}] Failed to start:`, err);
});
