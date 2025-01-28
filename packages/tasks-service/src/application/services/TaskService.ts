import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import { Task } from '../../domain/entities/Task';
import { generateRandomPrice } from 'common/src/utils';
import { TASK_STATUS } from 'common/src/constants';
import { CreateTaskDto, ProcessedImageDto, TaskResultDto } from 'common/src/dtos';
import { sendTaskToQueue } from '../../infrastructure/kafka/TaskCreatedProducer';
import { NotFoundError } from 'common/src/utils/errors';

export class TaskService {
  constructor(private taskRepository: ITaskRepository) {}
  async createTask(input: CreateTaskDto): Promise<TaskResultDto> {
    const taskData: Partial<Task> = {
      status: TASK_STATUS.PENDING,
      price: generateRandomPrice(5, 50),
      originalPath: input.originalPath,
    };
    const createdTask = await this.taskRepository.createTask(taskData);
    sendTaskToQueue(createdTask.id, createdTask.originalPath);
    return {
      taskId: createdTask.id,
      status: createdTask.status,
      price: createdTask.price,
    };
  }

  async getTask(taskId: string): Promise<TaskResultDto | null> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError('Task not found');
    return {
      taskId: task.id,
      status: task.status,
      price: task.price,
      images: task.images,
    };
  }

  async markTaskCompleted(taskId: string, images: ProcessedImageDto) {
    return this.taskRepository.updateTask(taskId, {
      status: TASK_STATUS.COMPLETED,
      images,
    });
  }

  async markTaskFailed(taskId: string, errorReason: string) {
    return this.taskRepository.updateTask(taskId, {
      status: TASK_STATUS.FAILED,
      errorReason,
    });
  }
}
