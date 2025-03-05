const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Collection = sequelize.define('Collection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  purchaseDate: {
    type: DataTypes.DATE
  },
  purchasePrice: {
    type: DataTypes.FLOAT
  },
  notes: {
    type: DataTypes.TEXT
  },
  bottleStatus: {
    type: DataTypes.ENUM('sealed', 'opened', 'empty'),
    defaultValue: 'sealed'
  }
});