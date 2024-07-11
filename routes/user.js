const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user');

// Get full data of all liked flashes for the current user
router.get('/like', auth, userController.getLikedFlashes);

// Add a flash to liked flashes
router.post('/like/:flashId', auth, userController.addFlashToLiked);

// Get one user by username
router.get('/:username', auth, userController.getOneUser);

// Get all users
router.get('/', auth, userController.getAllUsers);

// Update a user by ID
router.patch('/:id', auth, userController.updateUserById);

// Delete a user by ID
router.delete('/:id', auth, userController.deleteUserById);

module.exports = router;
