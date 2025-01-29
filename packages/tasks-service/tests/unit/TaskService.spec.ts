import { TaskService } from '../../src/application/services/TaskService';
import { ITaskRepository } from '../../src/domain/repositories/ITaskRepository';
import { Task } from '../../src/domain/entities/Task';
import { TASK_STATUS } from 'common/src/constants';
import * as utils from 'common/src/utils';
import { ProcessedImageDto, TaskResultDto } from 'common/src/dtos';

const mockTaskRepository = {
  createTask: jest.fn(),
  findById: jest.fn(),
  updateTask: jest.fn(),
} as jest.Mocked<ITaskRepository>;

const taskService = new TaskService(mockTaskRepository);

jest.mock('../../src/infrastructure/kafka/TaskCreatedProducer', () => ({
  sendTaskToQueue: jest.fn(),
}));

const mockTaskResult: TaskResultDto = {
  taskId: '1',
  status: TASK_STATUS.PENDING,
  price: 25,
  images: [],
};
const mockCreatedTask: TaskResultDto = {
  taskId: '1',
  status: TASK_STATUS.PENDING,
  price: 25,
};

const mockTask: Task = new Task('1', TASK_STATUS.PENDING, 25, 'path/to/image.jpg', [], '');

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a new task with PENDING status and random price', async () => {
      const generateRandomPriceMock = jest.spyOn(utils, 'generateRandomPrice').mockReturnValue(25);

      const input = { originalPath: 'path/to/image.jpg' };
      mockTaskRepository.createTask.mockResolvedValue(mockTask);

      const result = await taskService.createTask(input);

      expect(generateRandomPriceMock).toHaveBeenCalledWith(5, 50);
      expect(mockTaskRepository.createTask).toHaveBeenCalledWith({
        status: TASK_STATUS.PENDING,
        price: 25,
        originalPath: 'path/to/image.jpg',
      });
      expect(result).toEqual(mockCreatedTask);
    });
  });

  describe('getTask', () => {
    it('should return a task by id', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const result = await taskService.getTask('1');

      expect(mockTaskRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockTaskResult);
    });

    it('should throw NotFoundError if task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(taskService.getTask('999')).rejects.toThrow('Task not found');

      expect(mockTaskRepository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('markTaskCompleted', () => {
    it('should update task status to COMPLETED and add images', async () => {
      const images: ProcessedImageDto = [
        { resolution: 800, path: 'path/to/resized.jpg' },
        { resolution: 1024, path: 'path/to/resized.jpg' },
      ];
      mockTaskRepository.updateTask.mockResolvedValue(Promise.resolve());

      await taskService.markTaskCompleted('1', images);

      expect(mockTaskRepository.updateTask).toHaveBeenCalledWith('1', {
        status: TASK_STATUS.COMPLETED,
        images,
      });
    });
  });

  describe('markTaskFailed', () => {
    it('should update task status to FAILED', async () => {
      mockTaskRepository.updateTask.mockResolvedValue(Promise.resolve());

      await taskService.markTaskFailed('1', 'Error processing image');

      expect(mockTaskRepository.updateTask).toHaveBeenCalledWith('1', {
        status: TASK_STATUS.FAILED,
        errorReason: 'Error processing image',
      });
    });
  });
});
