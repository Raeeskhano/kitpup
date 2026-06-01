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

describe('Product API', () => {
  const sampleProduct = {
    name: 'Test Cat Toy',
    description: 'A fun toy for cats.',
    price: 9.99,
    category: 'Toys',
    stock: 50
  };

  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send(sampleProduct);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toEqual(sampleProduct.name);
    });

    it('should fail if missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Incomplete Product' });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/products', () => {
    it('should get all products', async () => {
      await request(app).post('/api/v1/products').send(sampleProduct);
      
      const res = await request(app).get('/api/v1/products');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toEqual(sampleProduct.name);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should get a product by ID', async () => {
      const createRes = await request(app).post('/api/v1/products').send(sampleProduct);
      const productId = createRes.body.data._id;
      
      const res = await request(app).get(`/api/v1/products/${productId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toEqual(productId);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/products/${fakeId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update a product', async () => {
      const createRes = await request(app).post('/api/v1/products').send(sampleProduct);
      const productId = createRes.body.data._id;
      
      const res = await request(app)
        .put(`/api/v1/products/${productId}`)
        .send({ price: 15.99 });
        
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toEqual(15.99);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete a product', async () => {
      const createRes = await request(app).post('/api/v1/products').send(sampleProduct);
      const productId = createRes.body.data._id;
      
      const res = await request(app).delete(`/api/v1/products/${productId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      
      const checkRes = await request(app).get(`/api/v1/products/${productId}`);
      expect(checkRes.statusCode).toEqual(404);
    });
  });
});
