const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const flashController = require('../controllers/flash');

// Route to create a flash
router.post('/new', auth, multer, flashController.createFlash);

// Route to update a flash
router.patch('/update', auth, multer, flashController.updateFlash);

// Route to delete a flash
router.delete('/delete', auth, flashController.deleteFlash);

// Route to get all flashes with optional tag filtering
router.get('/get', flashController.getAllFlashes);

// Route to get a single flash by ID
router.post('/getById', flashController.getFlashById);

module.exports = router;
