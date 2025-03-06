const jwt = require('jsonwebtoken');
const { User, Whiskey, Collection, Rating } = require('../../src/models');

/**
 * Test utilities to help with common testing operations
 */

// Clear all data from the database
const clearDatabase = async () => {
  await Rating.destroy({ where: {} });
  await Collection.destroy({ where: {} });
  await Whiskey.destroy({ where: {} });
  await User.destroy({ where: {} });
};

// Create a test user and return the user object and token
const createTestUser = async (userData = {}) => {
  const defaultData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123'
  };

  const mergedData = { ...defaultData, ...userData };
  const user = await User.create(mergedData);

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { user, token };
};

// Create a test whiskey
const createTestWhiskey = async (whiskeyData = {}) => {
  const defaultData = {
    name: `Test Whiskey ${Date.now()}`,
    distillery: 'Test Distillery',
    type: 'Bourbon',
    country: 'USA',
    region: 'Kentucky',
    age: 8,
    abv: 45.0,
    price: 39.99,
    description: 'A test whiskey'
  };

  const mergedData = { ...defaultData, ...whiskeyData };
  return await Whiskey.create(mergedData);
};

// Add whiskey to a user's collection
const addToCollection = async (userId, whiskeyId, collectionData = {}) => {
  const defaultData = {
    purchaseDate: new Date(),
    purchasePrice: 42.99,
    notes: 'Test collection entry',
    bottleStatus: 'sealed'
  };

  const mergedData = { 
    ...defaultData, 
    ...collectionData,
    UserId: userId,
    WhiskeyId: whiskeyId 
  };

  return await Collection.create(mergedData);
};

// Add a rating for a whiskey
const addRating = async (userId, whiskeyId, ratingData = {}) => {
  const defaultData = {
    score: 85,
    notes: 'Test rating notes',
    nose: 8,
    taste: 8,
    finish: 7
  };

  const mergedData = { 
    ...defaultData, 
    ...ratingData,
    UserId: userId,
    WhiskeyId: whiskeyId 
  };

  return await Rating.create(mergedData);
};

module.exports = {
  clearDatabase,
  createTestUser,
  createTestWhiskey,
  addToCollection,
  addRating
};