import { kafka } from 'common/src/config/kafka';
import { KAFKA_TOPICS } from 'common/src/constants';
import { TaskService } from '../../application/services/TaskService';
import logger from 'common/src/utils/logger';

export async function startTaskProcessedConsumer(taskService: TaskService): Promise<void> {
  const consumer = kafka.consumer({ groupId: 'tasks-service-task-processed' });
  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_TOPICS.TASK_PROCESSED, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const parsedMessage = JSON.parse(message.value?.toString() || '{}');
        const { taskId, images, error } = parsedMessage;
        if (error) {
          await taskService.markTaskFailed(taskId, error);
          logger.error(`[tasks-service] Task ${taskId} marked as FAILED, reason: ${error}`);
        } else {
          await taskService.markTaskCompleted(taskId, images);
          logger.info(`[tasks-service] Task ${taskId} marked as COMPLETED`);
        }
      } catch (err) {
        logger.error('[tasks-service] Error processing message in TaskProcessedConsumer:', err);
      }
    },
  });
}
