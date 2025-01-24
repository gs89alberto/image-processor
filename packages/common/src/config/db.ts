import mongoose from 'mongoose';
import config from './config';
import logger from '../utils/logger';

const MONGODB_URI = config.get('NODE_ENV') === 'test' ? config.get('MONGODB_URI_TEST') : config.get('MONGODB_URI');

export async function connectDB(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  logger.info(`[${config.get('SERVICE_NAME')}] Connected to MongoDB: ${MONGODB_URI}`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info(`[${config.get('SERVICE_NAME')}] Disconnected from MongoDB`);
}

export async function clearTestDatabase(): Promise<void> {
  if (mongoose.connection.db?.databaseName === 'image-processor-db-tests') {
    await mongoose.connection.db.dropDatabase();
  }
}
