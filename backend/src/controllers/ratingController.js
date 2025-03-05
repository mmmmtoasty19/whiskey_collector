const { Rating, Whiskey, User } = require('../models/Whiskey');

// Get all ratings for a whiskey
exports.getWhiskeyRatings = async (req, res) => {
  try {
    const { whiskeyId } = req.params;
    
    const ratings = await Rating.findAll({
      where: { WhiskeyId: whiskeyId },
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        }
      ]
    });
    
    res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
};

// Get user's ratings
exports.getUserRatings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const ratings = await Rating.findAll({
      where: { UserId: userId },
      include: [Whiskey]
    });
    
    res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ message: 'Error fetching user ratings' });
  }
};

// Add or update rating
exports.rateWhiskey = async (req, res) => {
  try {
    const userId = req.user.id;
    const { whiskeyId } = req.params;
    const { score, notes, nose, taste, finish } = req.body;
    
    // Check if whiskey exists
    const whiskey = await Whiskey.findByPk(whiskeyId);
    if (!whiskey) {
      return res.status(404).json({ message: 'Whiskey not found' });
    }
    
    // Check if user already rated this whiskey
    const existingRating = await Rating.findOne({
      where: {
        UserId: userId,
        WhiskeyId: whiskeyId
      }
    });
    
    let rating;
    
    if (existingRating) {
      // Update existing rating
      rating = await existingRating.update({
        score,
        notes,
        nose,
        taste,
        finish
      });
    } else {
      // Create new rating
      rating = await Rating.create({
        UserId: userId,
        WhiskeyId: whiskeyId,
        score,
        notes,
        nose,
        taste,
        finish
      });
    }
    
    // Get the rating with whiskey details
    const result = await Rating.findByPk(rating.id, {
      include: [Whiskey]
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error rating whiskey:', error);
    res.status(500).json({ message: 'Error rating whiskey' });
  }
};

// Delete rating
exports.deleteRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const rating = await Rating.findOne({
      where: {
        id,
        UserId: userId
      }
    });
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    await rating.destroy();
    
    res.status(200).json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ message: 'Error deleting rating' });
  }
};