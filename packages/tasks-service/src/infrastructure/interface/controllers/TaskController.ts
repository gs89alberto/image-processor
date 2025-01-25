import { NextFunction, Request, Response } from 'express';
import { TaskService } from '../../../application/services/TaskService';
import { CreateTaskDto } from 'common/src/dtos';

export class TaskController {
  constructor(private taskService: TaskService) {}

  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { originalPath }: CreateTaskDto = req.body;
      const task = await this.taskService.createTask({ originalPath });
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  };

  getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      const task = await this.taskService.getTask(taskId);
      res.json(task);
    } catch (error) {
      next(error);
    }
  };
}
