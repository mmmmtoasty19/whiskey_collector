const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check is user exits
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists'});
    }

    // Create a new user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate JWT 
    const token = jwt.sign(
      { id: user.id, username: user.username},
      process.env.JWT_SECRET,
      { expiresIn: '24h'}
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration'});
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ where: { email }});
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    // Validate Password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(404).json({message: "Invalid password"});
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username},
      process.env.JWT_SECRET,
      { expiresIn: '24h'}
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login'});
  }
}