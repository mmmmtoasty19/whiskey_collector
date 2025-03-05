const { sequelize } = require('../config/db');
const User = require('./User');
const Whiskey = require('./Whiskey');
const Collection = require('./Collection');
const Rating = require('./Rating');

// Define relationships

User.hasMany(Collection);
Collection.belongsTo(User);

Whiskey.hasMany(Collection);
Collection.belongsTo(Whiskey);

User.hasMany(Rating);
Rating.belongsTo(User);

Whiskey.hasMany(Rating);
Rating.belongsTo(Whiskey);

// Exports

module.exports = {
  User,
  Whiskey,
  Collection,
  Rating,
  sequelize
};
