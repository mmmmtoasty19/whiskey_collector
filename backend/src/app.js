const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, testConnection } = require('./config/db');
const { Op } = require('sequelize');

// Import routes
const authRoutes = require('./routes/authRoutes');
const whiskeyRoutes = require('./routes/whiskeyRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/whiskies', whiskeyRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/ratings', ratingRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Whiskey Collection API is running');
});

// Sync database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;