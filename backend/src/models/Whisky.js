const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Whiskey = sequelize.define('Whiskey', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  distillery: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  region: {
    type: DataTypes.STRING
  },
  age: {
    type: DataTypes.INTEGER
  },
  abv: {
    type: DataTypes.FLOAT
  },
  price: {
    type: DataTypes.FLOAT
  },
  description: {
    type: DataTypes.TEXT
  },
  imageUrl: {
    type: DataTypes.STRING
  }
});