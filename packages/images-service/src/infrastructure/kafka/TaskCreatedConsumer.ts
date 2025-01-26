import logger from 'common/src/utils/logger';
import config from 'common/src/config/config';
import { kafka } from 'common/src/config/kafka';
import { ImageService } from '../../application/services/ImageService';
import { Producer } from 'kafkajs';
import { KAFKA_TOPICS } from 'common/src/constants';

export async function startTaskCreatedConsumer(imageService: ImageService, producer: Producer): Promise<void> {
  const consumer = kafka.consumer({ groupId: 'images-service-task-created' });
  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_TOPICS.TASK_CREATED, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const content = JSON.parse(message.value?.toString() || '{}');
        const { taskId, originalPath } = content;

        logger.info(`[${config.get('SERVICE_NAME')}] Received task-created for taskId=${taskId}`);

        try {
          const processedImages = await imageService.processTask(originalPath);
          await producer.send({
            topic: KAFKA_TOPICS.TASK_PROCESSED,
            messages: [
              {
                value: JSON.stringify({
                  taskId,
                  images: processedImages,
                }),
              },
            ],
          });
          logger.info(`[${config.get('SERVICE_NAME')}] Successfully processed taskId=${taskId}`);
        } catch (error: any) {
          logger.error(`[${config.get('SERVICE_NAME')}] Error processing taskId=${taskId}:`, error);
          await producer.send({
            topic: KAFKA_TOPICS.TASK_FAILED,
            messages: [
              {
                value: JSON.stringify({
                  taskId,
                  error: error.message || 'Unknown error',
                }),
              },
            ],
          });
        }
      } catch (err) {
        logger.error(`[${config.get('SERVICE_NAME')}] Failed to parse message:`, err);
      }
    },
  });
}
