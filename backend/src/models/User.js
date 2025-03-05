const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  
  // Add password hashing hook
  User.beforeCreate(async (user) => {
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });
  
  // Add password validation method
  User.prototype.validatePassword = async function(password) {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, this.password);
  };
  
  return User;
};