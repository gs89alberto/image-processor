import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import { Task } from '../../domain/entities/Task';
import { TaskModel } from './TaskModel';

export class MongoTaskRepository implements ITaskRepository {
  async createTask(task: Partial<Task>): Promise<Task> {
    const createdTask = await TaskModel.create(task);
    return this.mapToTask(createdTask.toObject());
  }

  async findById(taskId: string): Promise<Task | null> {
    const foundTask = await TaskModel.findById(taskId).lean();
    return foundTask ? this.mapToTask(foundTask) : null;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    await TaskModel.findByIdAndUpdate(taskId, updates);
  }

  private mapToTask(taskDocument: any): Task {
    return new Task(
      taskDocument._id.toString(),
      taskDocument.status,
      taskDocument.price,
      taskDocument.originalPath,
      taskDocument.images
    );
  }
}
