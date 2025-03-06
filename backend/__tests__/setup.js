const { sequelize } = require('../src/models');

// Global test setup
beforeAll(async () => {
  // Make sure we're using the test database
  console.log('Setting up test database...');
  console.log('Database name:', process.env.DB_NAME);
  
  try {
    // Force sync will drop tables and recreate them
    await sequelize.sync({ force: true });
    console.log('Database synced successfully for tests');
  } catch (error) {
    console.error('Error syncing database for tests:', error);
    throw error; // Re-throw to fail tests if we can't set up the database
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    // Close database connection
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});