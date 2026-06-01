const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('User API', () => {
  const sampleUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user'
  };

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send(sampleUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toEqual(sampleUser.name);
      expect(res.body.data.email).toEqual(sampleUser.email);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should get all users', async () => {
      await request(app).post('/api/v1/users').send(sampleUser);
      
      const res = await request(app).get('/api/v1/users');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].email).toEqual(sampleUser.email);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get a user by ID', async () => {
      const createRes = await request(app).post('/api/v1/users').send(sampleUser);
      const userId = createRes.body.data._id;
      
      const res = await request(app).get(`/api/v1/users/${userId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toEqual(userId);
    });
  });
});
