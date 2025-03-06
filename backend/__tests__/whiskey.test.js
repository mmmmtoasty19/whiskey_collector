const request = require('supertest');
const app = require('../src/app');
const { User, Whiskey } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Whiskey Endpoints', () => {
  let token;
  let adminUser; // Store the user object
  let testWhiskey;

  // Setup: create users and get tokens
  beforeAll(async () => {
    // Create admin user
    try {
      // Clear users first
      await User.destroy({ where: {} });
      await Whiskey.destroy({ where: {} });
      
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'AdminPass123'
      });
      
      console.log('Created test user:', adminUser.id);
      
      // Generate token
      token = jwt.sign(
        { id: adminUser.id, username: adminUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      console.log('Generated token for tests');
      
      // Create test whiskey
      testWhiskey = await Whiskey.create({
        name: 'Test Bourbon',
        distillery: 'Test Distillery',
        type: 'Bourbon',
        country: 'USA',
        region: 'Kentucky',
        age: 8,
        abv: 45.0,
        price: 39.99,
        description: 'A test bourbon for our tests'
      });
      
      console.log('Created test whiskey:', testWhiskey.id);
    } catch (error) {
      console.error('Error in test setup:', error);
      throw error;
    }
  });

  describe('GET /api/whiskies', () => {
    it('should return all whiskies', async () => {
      const res = await request(app).get('/api/whiskies');
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/whiskies/:id', () => {
    it('should return whiskey by id', async () => {
      const res = await request(app).get(`/api/whiskies/${testWhiskey.id}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Test Bourbon');
      expect(res.body).toHaveProperty('distillery', 'Test Distillery');
    });

    it('should return 404 for non-existent whiskey', async () => {
      const res = await request(app).get('/api/whiskies/9999');
      
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /api/whiskies', () => {
    it('should create a new whiskey with auth', async () => {
      const newWhiskey = {
        name: 'Created Whiskey',
        distillery: 'Created Distillery',
        type: 'Single Malt',
        country: 'Scotland',
        region: 'Speyside',
        age: 12,
        abv: 43.0,
        price: 65.99,
        description: 'A whiskey created in tests'
      };

      console.log('Testing whiskey creation with token:', token ? 'Token present' : 'No token');
      
      const res = await request(app)
        .post('/api/whiskies')
        .set('Authorization', `Bearer ${token}`)
        .send(newWhiskey);
      
      if (res.statusCode !== 201) {
        console.log('Creation response:', res.status, res.body);
      }
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('name', 'Created Whiskey');
      expect(res.body).toHaveProperty('id');
    });

    it('should reject creation without auth', async () => {
      const newWhiskey = {
        name: 'Unauthorized Whiskey',
        distillery: 'Unauthorized Distillery',
        type: 'Single Malt',
        country: 'Scotland'
      };

      const res = await request(app)
        .post('/api/whiskies')
        .send(newWhiskey);
      
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('PUT /api/whiskies/:id', () => {
    it('should update a whiskey', async () => {
      // First, we need to make sure the whiskey exists
      let createdWhiskey;
      
      // Create a new whiskey to update
      try {
        createdWhiskey = await Whiskey.create({
          name: 'Whiskey To Update',
          distillery: 'Update Distillery',
          type: 'Bourbon',
          country: 'USA',
          region: 'Kentucky',
          age: 10,
          abv: 46.0,
          price: 49.99,
          description: 'A whiskey to be updated in tests'
        });
      } catch (error) {
        console.error('Error creating whiskey to update:', error);
      }
      
      const update = {
        name: 'Updated Whiskey',
        price: 75.99
      };

      const res = await request(app)
        .put(`/api/whiskies/${createdWhiskey.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(update);
      
      if (res.statusCode !== 200) {
        console.log('Update response:', res.status, res.body);
      }
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Updated Whiskey');
      expect(res.body).toHaveProperty('price', 75.99);
      // Original fields should remain
      expect(res.body).toHaveProperty('distillery', 'Update Distillery');
    });
  });

  describe('GET /api/whiskies/search', () => {
    it('should search whiskies by query', async () => {
      // Make sure we have a whiskey with this name
      await Whiskey.findOrCreate({
        where: { name: 'Updated Whiskey' },
        defaults: {
          distillery: 'Search Distillery',
          type: 'Bourbon',
          country: 'USA',
          region: 'Kentucky'
        }
      });
      
      const res = await request(app)
        .get('/api/whiskies/search')
        .query({ query: 'Updated' });
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.some(w => w.name === 'Updated Whiskey')).toBeTruthy();
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/whiskies/search')
        .query({ type: 'Bourbon' });
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.every(w => w.type === 'Bourbon')).toBeTruthy();
    });
  });
});