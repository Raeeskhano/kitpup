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

describe('Report API', () => {
  let reporterId;

  beforeEach(async () => {
    // Create a reporter user before each test
    const userRes = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Reporter Jane',
        email: 'jane.reporter@example.com',
        password: 'password123'
      });
    reporterId = userRes.body.data._id;
  });

  const getSampleReport = () => ({
    type: 'lost',
    petType: 'Dog',
    description: 'Lost my golden retriever near the park.',
    location: 'Central Park',
    reporter: reporterId
  });

  describe('POST /api/v1/reports', () => {
    it('should create a new report', async () => {
      const sampleReport = getSampleReport();
      const res = await request(app)
        .post('/api/v1/reports')
        .send(sampleReport);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toEqual(sampleReport.type);
    });
  });

  describe('GET /api/v1/reports', () => {
    it('should get all reports', async () => {
      await request(app).post('/api/v1/reports').send(getSampleReport());
      
      const res = await request(app).get('/api/v1/reports');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/v1/reports/:id', () => {
    it('should get a report by ID', async () => {
      const createRes = await request(app).post('/api/v1/reports').send(getSampleReport());
      const reportId = createRes.body.data._id;
      
      const res = await request(app).get(`/api/v1/reports/${reportId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toEqual(reportId);
    });
  });
});
