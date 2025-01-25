import express from 'express';
import { createRoutes } from '../../webserver/routes';
import { TaskController } from '../controllers/TaskController';
import { TaskService } from '../../../application/services/TaskService';
import { MongoTaskRepository } from '../../repositories/MongoTaskRepository';
import { createRateLimiter } from 'common/src/middleware/rateLimit.middleware';
import { NotFoundError } from 'common/src/utils/errors';
import { errorHandler } from 'common/src/middleware/error.middleware';

export function createHttpServer(): express.Express {
  const app = express();
  app.use(express.json());

  const taskRepository = new MongoTaskRepository();
  const taskService = new TaskService(taskRepository);
  const taskController = new TaskController(taskService);

  app.use(createRateLimiter);
  app.use('/', createRoutes(taskController));
  app.use(() => {
    throw new NotFoundError('Endpoint not found');
  });
  app.use(errorHandler);

  return app;
}
