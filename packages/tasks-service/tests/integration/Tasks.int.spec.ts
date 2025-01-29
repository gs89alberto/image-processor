import request from 'supertest';
import { createHttpServer } from '../../src/infrastructure/interface/http/server';
import { TASK_STATUS } from 'common/src/constants';
import { App } from 'supertest/types';
import { clearTestDatabase, connectDB, disconnectDB } from 'common/src/config/db';
import { TaskModel } from '../../src/infrastructure/repositories/TaskModel';

jest.mock('../../src/infrastructure/kafka/TaskCreatedProducer', () => ({
  sendTaskToQueue: jest.fn(),
}));

describe('Tasks API Integration', () => {
  let app: App;

  beforeAll(async () => {
    await connectDB();
    app = createHttpServer();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  it('POST /tasks - should create a new task with pending status and price', async () => {
    const response = await request(app).post('/tasks').send({ originalPath: '/some/local/path.jpg' }).expect(201);

    expect(response.body).toHaveProperty('taskId');
    expect(response.body).toHaveProperty('status', TASK_STATUS.PENDING);
    expect(response.body).toHaveProperty('price');
    expect(typeof response.body.price).toBe('number');

    const createdTask = await TaskModel.findById(response.body.taskId).lean();
    expect(createdTask).not.toBeNull();
    expect(createdTask?.status).toBe(TASK_STATUS.PENDING);
  });

  it('GET /tasks/:taskId - returns 404 if not found', async () => {
    const invalidTaskId = '000000000000000000000000';
    const response = await request(app).get(`/tasks/${invalidTaskId}`).expect(404);

    expect(response.body).toHaveProperty('error', { message: 'Task not found' });
  });

  it('GET /tasks/:taskId - returns pending task with only status and price', async () => {
    const createTask = await request(app)
      .post('/tasks')
      .send({ originalPath: 'http://example.com/img.jpg' })
      .expect(201);

    const { taskId } = createTask.body;

    const getRes = await request(app).get(`/tasks/${taskId}`).expect(200);

    expect(getRes.body).toMatchObject({
      taskId,
      status: TASK_STATUS.PENDING,
      price: expect.any(Number),
    });
    expect(getRes.body.images).toEqual([]);
  });

  it('GET /tasks/:taskId - returns completed task with images if status=completed', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .send({ originalPath: 'http://example.com/img2.jpg' })
      .expect(201);
    const { taskId } = createRes.body;

    await TaskModel.findByIdAndUpdate(taskId, {
      status: TASK_STATUS.COMPLETED,
      images: [
        { resolution: 1024, path: '/output/img2/1024/abcd.jpg' },
        { resolution: 800, path: '/output/img2/800/efgh.jpg' },
      ],
    });

    const getRes = await request(app).get(`/tasks/${taskId}`).expect(200);

    expect(getRes.body).toMatchObject({
      taskId,
      status: TASK_STATUS.COMPLETED,
      price: expect.any(Number),
      images: [
        { resolution: 1024, path: '/output/img2/1024/abcd.jpg' },
        { resolution: 800, path: '/output/img2/800/efgh.jpg' },
      ],
    });
  });

  it('should set task status to "failed" if image processing fails', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .send({ originalPath: 'http://example.com/error.jpg' })
      .expect(201);

    const { taskId } = createRes.body;

    await TaskModel.findByIdAndUpdate(taskId, {
      status: TASK_STATUS.FAILED,
    });

    const getRes = await request(app).get(`/tasks/${taskId}`).expect(200);

    expect(getRes.body).toMatchObject({
      taskId,
      status: TASK_STATUS.FAILED,
      price: expect.any(Number),
    });
  });
});
