// src/config/db.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Load environment-specific variables
if (process.env.NODE_ENV === 'test') {
  console.log('Loading TEST environment variables');
  dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
} else {
  console.log('Loading DEVELOPMENT environment variables');
  dotenv.config();
}

console.log('Environment:', process.env.NODE_ENV);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };