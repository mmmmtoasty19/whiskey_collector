const express = require('express');
const collectionController = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All collection routes require authentication
router.use(authMiddleware);

router.get('/', collectionController.getUserCollection);
router.post('/', collectionController.addToCollection);
router.put('/:id', collectionController.updateCollectionEntry);
router.delete('/:id', collectionController.removeFromCollection);

module.exports = router;