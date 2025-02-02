import logger from 'common/src/utils/logger';
import config from 'common/src/config/config';
import { kafka } from 'common/src/config/kafka';
import { ImageService } from '../../application/services/ImageService';
import { Producer, EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from 'common/src/constants';
import { ProcessedImageDto } from 'common/src/dtos';

export async function startTaskCreatedConsumer(imageService: ImageService, producer: Producer): Promise<void> {
  const consumer = kafka.consumer({ groupId: 'images-service-task-created' });
  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_TOPICS.TASK_CREATED, fromBeginning: false });

  await consumer.run({
    eachMessage: async (payload: EachMessagePayload) => {
      await handleMessage(payload, imageService, producer);
    },
  });
}

async function handleMessage(
  payload: EachMessagePayload,
  imageService: ImageService,
  producer: Producer
): Promise<void> {
  const { message } = payload;
  try {
    const content = JSON.parse(message.value?.toString() || '{}');
    const { taskId, originalPath } = content;

    logger.info(`[${config.get('SERVICE_NAME')}] Received task-created for taskId=${taskId}`);

    try {
      const processedImages = await imageService.processTask(originalPath);
      await sendProcessedMessage(producer, taskId, processedImages);
      logger.info(`[${config.get('SERVICE_NAME')}] Successfully processed taskId=${taskId}`);
    } catch (error: any) {
      logger.error(`[${config.get('SERVICE_NAME')}] Error processing taskId=${taskId}:`, error);
      await sendErrorMessage(producer, taskId, error.message || 'Unknown error');
    }
  } catch (err) {
    logger.error(`[${config.get('SERVICE_NAME')}] Failed to parse message:`, err);
  }
}

async function sendProcessedMessage(producer: Producer, taskId: string, images: ProcessedImageDto): Promise<void> {
  await producer.send({
    topic: KAFKA_TOPICS.TASK_PROCESSED,
    messages: [
      {
        value: JSON.stringify({
          taskId,
          images,
        }),
      },
    ],
  });
}

async function sendErrorMessage(producer: Producer, taskId: string, error: string): Promise<void> {
  await producer.send({
    topic: KAFKA_TOPICS.TASK_PROCESSED,
    messages: [
      {
        value: JSON.stringify({
          taskId,
          error,
        }),
      },
    ],
  });
}
