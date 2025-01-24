import { Kafka } from 'kafkajs';
import config from './config';

const KAFKA_BROKER = config.get('KAFKA_BROKER') || 'localhost:9092';

export const kafka = new Kafka({
  clientId: `${config.get('SERVICE_NAME')}`,
  brokers: [KAFKA_BROKER],
});
