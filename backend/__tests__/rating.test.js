const request = require('supertest');
const app = require('../src/app');
const { User, Whiskey, Rating } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Rating Endpoints', () => {
  let token;
  let userToken;
  let testUser;
  let secondUser;
  let testWhiskey;

  // Setup: create users, whiskey, and tokens
  beforeAll(async () => {
    // Clear data
    await Rating.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Whiskey.destroy({ where: {} });

    // Create test users
    testUser = await User.create({
      username: 'ratingtester',
      email: 'rating@example.com',
      password: 'Password123'
    });

    secondUser = await User.create({
      username: 'secondrater',
      email: 'rater2@example.com',
      password: 'Password123'
    });

    // Generate tokens
    token = jwt.sign(
      { id: testUser.id, username: testUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    userToken = jwt.sign(
      { id: secondUser.id, username: secondUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create test whiskey
    testWhiskey = await Whiskey.create({
      name: 'Rating Test Whiskey',
      distillery: 'Rating Distillery',
      type: 'Irish',
      country: 'Ireland',
      age: 5,
      abv: 41.0,
      price: 35.99,
      description: 'A whiskey for rating tests'
    });
  });

  describe('Rating Operations', () => {
    it('should add a rating to a whiskey', async () => {
      const ratingData = {
        score: 87,
        notes: 'Smooth with vanilla and oak notes',
        nose: 8,
        taste: 9,
        finish: 7
      };

      const res = await request(app)
        .post(`/api/ratings/whiskey/${testWhiskey.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(ratingData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('score', 87);
      expect(res.body).toHaveProperty('nose', 8);
      expect(res.body).toHaveProperty('UserId', testUser.id);
      expect(res.body).toHaveProperty('WhiskeyId', testWhiskey.id);
    });

    it('should allow multiple users to rate same whiskey', async () => {
      const ratingData = {
        score: 78,
        notes: 'A bit harsh with strong alcohol presence',
        nose: 6,
        taste: 7,
        finish: 5
      };

      const res = await request(app)
        .post(`/api/ratings/whiskey/${testWhiskey.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(ratingData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('score', 78);
      expect(res.body).toHaveProperty('UserId', secondUser.id);
    });

    it('should get all ratings for a whiskey', async () => {
      const res = await request(app)
        .get(`/api/ratings/whiskey/${testWhiskey.id}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toEqual(2);
      
      // Check that both users' ratings are included
      const userIds = res.body.map(r => r.UserId);
      expect(userIds).toContain(testUser.id);
      expect(userIds).toContain(secondUser.id);
    });

    it('should get user\'s ratings', async () => {
      const res = await request(app)
        .get('/api/ratings/user')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toEqual(1);
      expect(res.body[0]).toHaveProperty('UserId', testUser.id);
      expect(res.body[0]).toHaveProperty('Whiskey');
      expect(res.body[0].Whiskey).toHaveProperty('name', 'Rating Test Whiskey');
    });

    it('should update user\'s rating', async () => {
      const updateData = {
        score: 92,
        notes: 'Changed my mind, this is excellent',
        nose: 9,
        taste: 9,
        finish: 8
      };

      const res = await request(app)
        .post(`/api/ratings/whiskey/${testWhiskey.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('score', 92);
      expect(res.body).toHaveProperty('notes', 'Changed my mind, this is excellent');
    });

    it('should delete a rating', async () => {
      // First get the rating ID
      const ratingsRes = await request(app)
        .get('/api/ratings/user')
        .set('Authorization', `Bearer ${token}`);
      
      const ratingId = ratingsRes.body[0].id;

      // Now delete it
      const res = await request(app)
        .delete(`/api/ratings/${ratingId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');

      // Verify it's gone
      const checkRes = await request(app)
        .get('/api/ratings/user')
        .set('Authorization', `Bearer ${token}`);
      
      expect(checkRes.body.length).toEqual(0);
    });
  });
});