export const DEFAULT_RESOLUTIONS = [1024, 800];

export enum TASK_STATUS {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
};

export const KAFKA_TOPICS = {
  TASK_CREATED: 'task-created',
  TASK_PROCESSED: 'task-processed',
};
