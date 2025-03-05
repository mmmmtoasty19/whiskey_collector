const express = require('express');
const whiskeyController = require('../controllers/whiskeyController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', whiskeyController.getAllWhiskies);
router.get('/search', whiskeyController.searchWhiskies);
router.get('/:id', whiskeyController.getWhiskeyById);
router.post('/', authMiddleware, whiskeyController.createWhiskey);
router.put('/:id', authMiddleware, whiskeyController.updateWhiskey);
router.delete('/:id', authMiddleware, whiskeyController.deleteWhiskey);

module.exports = router;
