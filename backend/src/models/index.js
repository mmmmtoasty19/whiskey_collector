// src/models/index.js
const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

// Initialize models
const User = require('./User')(sequelize);
const Whiskey = require('./Whiskey')(sequelize);
const Collection = require('./Collection')(sequelize);
const Rating = require('./Rating')(sequelize);

// Define associations
User.hasMany(Collection);
Collection.belongsTo(User);

Whiskey.hasMany(Collection);
Collection.belongsTo(Whiskey);

User.hasMany(Rating);
Rating.belongsTo(User);

Whiskey.hasMany(Rating);
Rating.belongsTo(Whiskey);

// Export models
module.exports = {
  User,
  Whiskey,
  Collection,
  Rating,
  sequelize
};