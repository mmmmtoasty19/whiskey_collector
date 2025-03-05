const { Collection, Whiskey } = require('../models');

// Get user's collection
exports.getUserCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const collection = await Collection.findAll({
      where: { UserId: userId },
      include: [Whiskey]
    });
    
    res.status(200).json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ message: 'Error fetching collection' });
  }
};

// Add whiskey to collection
exports.addToCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { whiskeyId, purchaseDate, purchasePrice, notes, bottleStatus } = req.body;
    
    // Check if whiskey exists
    const whiskey = await Whiskey.findByPk(whiskeyId);
    if (!whiskey) {
      return res.status(404).json({ message: 'Whiskey not found' });
    }
    
    // Check if already in collection
    const existingEntry = await Collection.findOne({
      where: {
        UserId: userId,
        WhiskeyId: whiskeyId
      }
    });
    
    if (existingEntry) {
      return res.status(400).json({ message: 'Whiskey already in collection' });
    }
    
    // Add to collection
    const collectionEntry = await Collection.create({
      UserId: userId,
      WhiskeyId: whiskeyId,
      purchaseDate,
      purchasePrice,
      notes,
      bottleStatus
    });
    
    // Get the collection entry with whiskey details
    const result = await Collection.findByPk(collectionEntry.id, {
      include: [Whiskey]
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding to collection:', error);
    res.status(500).json({ message: 'Error adding to collection' });
  }
};

// Update collection entry
exports.updateCollectionEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const entry = await Collection.findOne({
      where: {
        id,
        UserId: userId
      }
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Collection entry not found' });
    }
    
    await entry.update(req.body);
    
    // Get updated entry with whiskey details
    const updatedEntry = await Collection.findByPk(entry.id, {
      include: [Whiskey]
    });
    
    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('Error updating collection entry:', error);
    res.status(500).json({ message: 'Error updating collection entry' });
  }
};

// Remove from collection
exports.removeFromCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const entry = await Collection.findOne({
      where: {
        id,
        UserId: userId
      }
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Collection entry not found' });
    }
    
    await entry.destroy();
    
    res.status(200).json({ message: 'Removed from collection successfully' });
  } catch (error) {
    console.error('Error removing from collection:', error);
    res.status(500).json({ message: 'Error removing from collection' });
  }
};