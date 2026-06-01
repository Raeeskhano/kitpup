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

describe('Pet API', () => {
  let ownerId;

  beforeEach(async () => {
    // Create an owner before each pet test
    const userRes = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      });
    ownerId = userRes.body.data._id;
  });

  const getSamplePet = () => ({
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: 3,
    description: 'A very good boy.',
    price: 500,
    owner: ownerId
  });

  describe('POST /api/v1/pets', () => {
    it('should create a new pet', async () => {
      const samplePet = getSamplePet();
      const res = await request(app)
        .post('/api/v1/pets')
        .send(samplePet);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toEqual(samplePet.name);
    });
  });

  describe('GET /api/v1/pets', () => {
    it('should get all pets', async () => {
      await request(app).post('/api/v1/pets').send(getSamplePet());
      
      const res = await request(app).get('/api/v1/pets');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/v1/pets/:id', () => {
    it('should get a pet by ID', async () => {
      const createRes = await request(app).post('/api/v1/pets').send(getSamplePet());
      const petId = createRes.body.data._id;
      
      const res = await request(app).get(`/api/v1/pets/${petId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toEqual(petId);
    });
  });
});
