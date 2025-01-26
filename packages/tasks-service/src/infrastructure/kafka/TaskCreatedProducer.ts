import logger from 'common/src/utils/logger';
import config from 'common/src/config/config';
import { Kafka } from 'kafkajs';
import { KAFKA_TOPICS } from 'common/src/constants';

const kafka = new Kafka({
  clientId: 'tasks-producer',
  brokers: [config.get('KAFKA_BROKER') || 'localhost:9092'],
});

const producer = kafka.producer();

export async function sendTaskToQueue(taskId: string, imagePath: string) {
  await producer.connect();
  await producer.send({
    topic: KAFKA_TOPICS.TASK_CREATED,
    messages: [
      {
        value: JSON.stringify({
          taskId,
          originalPath: imagePath,
        }),
      },
    ],
  });
  await producer.disconnect();
  logger.info(`Task sent to Kafka: ${taskId}`);
}
