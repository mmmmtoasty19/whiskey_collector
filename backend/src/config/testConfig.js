const dotenv = require('dotenv');
const path = require('path');

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

module.exports = {
  testDbConfig: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
};