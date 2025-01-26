import logger from 'common/src/utils/logger';
import config from 'common/src/config/config';
import { connectDB } from 'common/src/config/db';
import { createHttpServer } from './infrastructure/interface/http/server';
import { TaskService } from './application/services/TaskService';
import { MongoTaskRepository } from './infrastructure/repositories/MongoTaskRepository';
import { startTaskProcessedConsumer } from './infrastructure/kafka/TaskProcessedConsumer';
import { startTaskFailedConsumer } from './infrastructure/kafka/TaskFailedConsumer';

async function start() {
  await connectDB();

  const app = createHttpServer();
  const port = config.get('PORT') || 3000;

  const taskRepository = new MongoTaskRepository();
  const taskService = new TaskService(taskRepository);
  await startTaskProcessedConsumer(taskService);
  await startTaskFailedConsumer(taskService);

  app.listen(port, () => {
    logger.info(`[${config.get('SERVICE_NAME')}] Server running on port ${port}`);
  });
}

start().catch((err) => {
  logger.error(`[${config.get('SERVICE_NAME')}] Failed to start:`, err);
});
