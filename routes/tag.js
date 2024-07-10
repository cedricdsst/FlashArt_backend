const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tagController = require('../controllers/tag');

// Create a new tag
router.post('/', auth, tagController.createTag);

// Get all tags
router.get('/',  tagController.getAllTags);

// Get a tag by ID
router.get('/:id', tagController.getTagById);

// Update a tag by ID
router.patch('/:id', auth, tagController.updateTagById);

// Delete a tag by ID
router.delete('/:id', auth, tagController.deleteTagById);

module.exports = router;
