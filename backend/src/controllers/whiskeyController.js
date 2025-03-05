const { Whiskey } = require('../models');
const { Op } = require('sequelize');

// Get all whiskies
exports.getAllWhiskies = async (req, res) => {
  try {
    const whiskies = await Whiskey.findAll();
    res.status(200).json(whiskies);
  } catch (error) {
    console.error('Error fetching whiskies:', error);
    res.status(500).json({ message: 'Error fetching whiskies' });
  }
};

// Get whiskey by ID
exports.getWhiskeyById = async (req, res) => {
  try {
    const whiskey = await Whiskey.findByPk(req.params.id);
    if (!whiskey) {
      return res.status(404).json({ message: 'Whiskey not found' });
    }
    res.status(200).json(whiskey);
  } catch (error) {
    console.error('Error fetching whiskey:', error);
    res.status(500).json({ message: 'Error fetching whiskey' });
  }
};

// Create new whiskey
exports.createWhiskey = async (req, res) => {
  try {
    const {
      name,
      distillery,
      type,
      country,
      region,
      age,
      abv,
      price,
      description,
      imageUrl
    } = req.body;

    const whiskey = await Whiskey.create({
      name,
      distillery,
      type,
      country,
      region,
      age,
      abv,
      price,
      description,
      imageUrl
    });

    res.status(201).json(whiskey);
  } catch (error) {
    console.error('Error creating whiskey:', error);
    res.status(500).json({ message: 'Error creating whiskey' });
  }
};

// Update whiskey
exports.updateWhiskey = async (req, res) => {
  try {
    const whiskey = await Whiskey.findByPk(req.params.id);
    if (!whiskey) {
      return res.status(404).json({ message: 'Whiskey not found' });
    }

    await whiskey.update(req.body);
    res.status(200).json(whiskey);
  } catch (error) {
    console.error('Error updating whiskey:', error);
    res.status(500).json({ message: 'Error updating whiskey' });
  }
};

// Delete whiskey
exports.deleteWhiskey = async (req, res) => {
  try {
    const whiskey = await Whiskey.findByPk(req.params.id);
    if (!whiskey) {
      return res.status(404).json({ message: 'Whiskey not found' });
    }

    await whiskey.destroy();
    res.status(200).json({ message: 'Whiskey deleted successfully' });
  } catch (error) {
    console.error('Error deleting whiskey:', error);
    res.status(500).json({ message: 'Error deleting whiskey' });
  }
};

// Search whiskies
exports.searchWhiskies = async (req, res) => {
  try {
    const { query, type, country } = req.query;
    
    let whereClause = {};
    
    if (query) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { distillery: { [Op.iLike]: `%${query}%` } }
        ]
      };
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (country) {
      whereClause.country = country;
    }
    
    const whiskies = await Whiskey.findAll({
      where: whereClause
    });
    
    res.status(200).json(whiskies);
  } catch (error) {
    console.error('Error searching whiskies:', error);
    res.status(500).json({ message: 'Error searching whiskies' });
  }
};