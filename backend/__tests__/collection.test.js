const request = require('supertest');
const app = require('../src/app');
const { User, Whiskey, Collection } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Collection Endpoints', () => {
  let token;
  let testUser;
  let testWhiskey;
  let testCollection;

  // Setup: create user, whiskey, and token
  beforeAll(async () => {
    // Clear data
    await Collection.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Whiskey.destroy({ where: {} });

    // Create test user
    testUser = await User.create({
      username: 'collectiontester',
      email: 'collection@example.com',
      password: 'Password123'
    });

    // Generate token
    token = jwt.sign(
      { id: testUser.id, username: testUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create test whiskey
    testWhiskey = await Whiskey.create({
      name: 'Collection Test Whiskey',
      distillery: 'Collection Distillery',
      type: 'Rye',
      country: 'USA',
      region: 'Tennessee',
      age: 6,
      abv: 50.0,
      price: 42.99,
      description: 'A whiskey for collection tests'
    });
  });

  describe('Collection CRUD Operations', () => {
    it('should add whiskey to collection', async () => {
      const collectionData = {
        whiskeyId: testWhiskey.id,
        purchaseDate: '2023-05-15',
        purchasePrice: 39.99,
        notes: 'Birthday gift',
        bottleStatus: 'sealed'
      };

      const res = await request(app)
        .post('/api/collection')
        .set('Authorization', `Bearer ${token}`)
        .send(collectionData);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('WhiskeyId', testWhiskey.id);
      expect(res.body).toHaveProperty('UserId', testUser.id);
      expect(res.body).toHaveProperty('purchasePrice', 39.99);
      expect(res.body).toHaveProperty('bottleStatus', 'sealed');

      // Save for later tests
      testCollection = res.body;
    });

    it('should reject adding duplicate whiskey to collection', async () => {
      const collectionData = {
        whiskeyId: testWhiskey.id,
        purchaseDate: '2023-06-20',
        purchasePrice: 45.99,
        bottleStatus: 'sealed'
      };

      const res = await request(app)
        .post('/api/collection')
        .set('Authorization', `Bearer ${token}`)
        .send(collectionData);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should get user collection', async () => {
      const res = await request(app)
        .get('/api/collection')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('Whiskey');
      expect(res.body[0].Whiskey).toHaveProperty('name', 'Collection Test Whiskey');
    });

    it('should update collection entry', async () => {
      const updateData = {
        purchasePrice: 44.99,
        bottleStatus: 'opened',
        notes: 'Opened for tasting'
      };

      const res = await request(app)
        .put(`/api/collection/${testCollection.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('bottleStatus', 'opened');
      expect(res.body).toHaveProperty('purchasePrice', 44.99);
      expect(res.body).toHaveProperty('notes', 'Opened for tasting');
    });

    it('should remove whiskey from collection', async () => {
      const res = await request(app)
        .delete(`/api/collection/${testCollection.id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');

      // Verify it's gone
      const checkRes = await request(app)
        .get('/api/collection')
        .set('Authorization', `Bearer ${token}`);
      
      expect(checkRes.body.every(item => item.id !== testCollection.id)).toBeTruthy();
    });

    it('should reject unauthorized access', async () => {
      const res = await request(app).get('/api/collection');
      
      expect(res.statusCode).toEqual(401);
    });
  });
});