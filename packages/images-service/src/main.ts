import config from 'common/src/config/config';
import logger from 'common/src/utils/logger';
import { connectDB } from 'common/src/config/db';
import { kafka } from 'common/src/config/kafka';
import { startTaskCreatedConsumer } from './infrastructure/kafka/TaskCreatedConsumer';
import { ImageService } from './application/services/ImageService';
import { MongoImageRepository } from './infrastructure/repositories/MongoImageRepository';

async function start() {
  await connectDB();

  const imageRepo = new MongoImageRepository();
  const imageService = new ImageService(imageRepo);

  const producer = kafka.producer();
  await producer.connect();

  await startTaskCreatedConsumer(imageService, producer);

  logger.info(`[${config.get('SERVICE_NAME')}] running...`);
}

start().catch((err) => {
  logger.error(`[${config.get('SERVICE_NAME')}] Failed to start:`, err);
});
