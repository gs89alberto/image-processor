import { Request, Response, NextFunction } from 'express';
import { TaskController } from '../../src/infrastructure/interface/controllers/TaskController';
import { TaskService } from '../../src/application/services/TaskService';
import { TASK_STATUS } from 'common/src/constants';

describe('TaskController Unit Tests', () => {
  let mockTaskService: jest.Mocked<TaskService>;
  let taskController: TaskController;

  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockTaskService = {
      createTask: jest.fn(),
      getTask: jest.fn(),
      markTaskInProgress: jest.fn(),
      markTaskCompleted: jest.fn(),
      markTaskFailed: jest.fn(),
    } as unknown as jest.Mocked<TaskService>;

    taskController = new TaskController(mockTaskService);

    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a new task, send it to queue, and respond with 201', async () => {
      mockReq.body = { originalPath: '/path/to/image.jpg' };

      mockTaskService.createTask.mockResolvedValue({
        taskId: '123',
        status: TASK_STATUS.PENDING,
        price: 42,
      });

      await taskController.createTask(mockReq as Request, mockRes as Response, mockNext);

      expect(mockTaskService.createTask).toHaveBeenCalledWith({
        originalPath: '/path/to/image.jpg',
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        taskId: '123',
        status: TASK_STATUS.PENDING,
        price: 42,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next(error) if createTask throws', async () => {
      const fakeError = new Error('DB Error');
      mockTaskService.createTask.mockRejectedValue(fakeError);

      mockReq.body = { originalPath: '/path/to/image.jpg' };

      await taskController.createTask(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(fakeError);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('getTask', () => {
    it('should respond with the task if found', async () => {
      mockReq.params = { taskId: 'task123' };
      mockTaskService.getTask.mockResolvedValue({
        taskId: 'task123',
        status: TASK_STATUS.PENDING,
        price: 25,
        images: [{ resolution: 800, path: '/some/path.jpg' }],
      });

      await taskController.getTask(mockReq as Request, mockRes as Response, mockNext);

      expect(mockTaskService.getTask).toHaveBeenCalledWith('task123');
      expect(mockRes.json).toHaveBeenCalledWith({
        taskId: 'task123',
        status: TASK_STATUS.PENDING,
        price: 25,
        images: [{ resolution: 800, path: '/some/path.jpg' }],
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next(error) if getTask throws an error', async () => {
      mockReq.params = { taskId: 'task123' };
      const fakeError = new Error('DB Problem');
      mockTaskService.getTask.mockRejectedValue(fakeError);

      await taskController.getTask(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(fakeError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});
