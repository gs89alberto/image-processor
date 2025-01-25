import { CreateTaskDto } from 'common/src/dtos';
import { Task } from '../entities/Task';

export interface ITaskRepository {
  createTask(task: Partial<CreateTaskDto>): Promise<Task>;
  findById(taskId: string): Promise<Task | null>;
  updateTask(taskId: string, updates: Partial<Task>): Promise<void>;
}
