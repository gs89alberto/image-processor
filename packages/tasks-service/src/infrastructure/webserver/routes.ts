import { Router } from 'express';
import { TaskController } from '../interface/controllers/TaskController';
import { createTaskValidation, getTaskValidation } from '../interface/http/validators/tasks.validatror';

export function createRoutes(taskController: TaskController): Router {
  const router = Router();

  router.post('/tasks', createTaskValidation, taskController.createTask);
  router.get('/tasks/:taskId', getTaskValidation, taskController.getTask);

  return router;
}
