const express = require('express');
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public route
router.get('/whiskey/:whiskeyId', ratingController.getWhiskeyRatings);

// Protected routes
router.use(authMiddleware);
router.get('/user', ratingController.getUserRatings);
router.post('/whiskey/:whiskeyId', ratingController.rateWhiskey);
router.delete('/:id', ratingController.deleteRating);

module.exports = router;