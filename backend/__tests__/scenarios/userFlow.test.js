const request = require('supertest');
const app = require('../../src/app');
const { clearDatabase } = require('../utils/testUtils');

describe('Complete User Flow Scenarios', () => {
  beforeAll(async () => {
    await clearDatabase();
  });
  
  describe('User Registration, Collection and Rating Workflow', () => {
    let token;
    let userId;
    let whiskeyId;
    let collectionId;
    
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'flowuser',
          email: 'flow@example.com',
          password: 'FlowPassword123'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      
      token = res.body.token;
      userId = res.body.user.id;
    });
    
    it('should create a new whiskey', async () => {
      const newWhiskey = {
        name: 'Flow Test Whiskey',
        distillery: 'Flow Distillery',
        type: 'Scotch',
        country: 'Scotland',
        region: 'Highlands',
        age: 15,
        abv: 46.0,
        price: 85.99,
        description: 'A whiskey for end-to-end flow testing'
      };
      
      const res = await request(app)
        .post('/api/whiskies')
        .set('Authorization', `Bearer ${token}`)
        .send(newWhiskey);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      
      whiskeyId = res.body.id;
    });
    
    it('should add whiskey to collection', async () => {
      const collectionData = {
        whiskeyId: whiskeyId,
        purchaseDate: '2023-07-20',
        purchasePrice: 82.99,
        notes: 'Special occasion purchase',
        bottleStatus: 'sealed'
      };
      
      const res = await request(app)
        .post('/api/collection')
        .set('Authorization', `Bearer ${token}`)
        .send(collectionData);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('WhiskeyId', whiskeyId);
      
      collectionId = res.body.id;
    });
    
    it('should rate the whiskey', async () => {
      const ratingData = {
        score: 90,
        notes: 'Excellent balance and complexity',
        nose: 9,
        taste: 9,
        finish: 8
      };
      
      const res = await request(app)
        .post(`/api/ratings/whiskey/${whiskeyId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(ratingData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('score', 90);
      expect(res.body).toHaveProperty('WhiskeyId', whiskeyId);
    });
    
    it('should update bottle status after opening', async () => {
      const updateData = {
        bottleStatus: 'opened',
        notes: 'Special occasion purchase - opened for anniversary'
      };
      
      const res = await request(app)
        .put(`/api/collection/${collectionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('bottleStatus', 'opened');
    });
    
    it('should retrieve full user collection with whiskey details', async () => {
      const res = await request(app)
        .get('/api/collection')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      
      const collectionItem = res.body.find(item => item.id === collectionId);
      expect(collectionItem).toBeDefined();
      expect(collectionItem).toHaveProperty('Whiskey');
      expect(collectionItem.Whiskey).toHaveProperty('name', 'Flow Test Whiskey');
      expect(collectionItem).toHaveProperty('bottleStatus', 'opened');
    });
    
    it('should retrieve user ratings with whiskey details', async () => {
      const res = await request(app)
        .get('/api/ratings/user')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      
      const userRating = res.body[0];
      expect(userRating).toHaveProperty('Whiskey');
      expect(userRating.Whiskey).toHaveProperty('name', 'Flow Test Whiskey');
      expect(userRating).toHaveProperty('score', 90);
    });
  });
});