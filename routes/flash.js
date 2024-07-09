const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const flashController = require('../controllers/flash');

// Route to create a flash
router.post('/', auth, multer, flashController.createFlash);

// Route to update a flash
router.patch('/:flashId', auth, multer, flashController.updateFlash);

// Route to delete a flash
router.delete('/:flashId', auth, flashController.deleteFlash);

// Route to get all flashes with optional tag filtering
router.get('/', flashController.getAllFlashes);

// Route to get a single flash by ID
router.get('/:flashId', flashController.getFlashById);

module.exports = router;
