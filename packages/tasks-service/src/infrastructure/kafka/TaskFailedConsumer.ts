import { kafka } from 'common/src/config/kafka';
import { KAFKA_TOPICS } from 'common/src/constants';
import { TaskService } from '../../application/services/TaskService';
import logger from 'common/src/utils/logger';

export async function startTaskFailedConsumer(taskService: TaskService): Promise<void> {
  const consumer = kafka.consumer({ groupId: 'tasks-service-task-failed' });
  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_TOPICS.TASK_FAILED, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const { taskId, error } = JSON.parse(message.value?.toString() || '{}');
        await taskService.markTaskFailed(taskId, error);
        logger.error(`[tasks-service] Task ${taskId} marked as FAILED, reason: ${error}`);
      } catch (err) {
        logger.error('[tasks-service] Error in TaskFailedConsumer:', err);
      }
    },
  });
}
