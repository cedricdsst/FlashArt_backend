const mongoose = require('mongoose');
const User = require('../models/User');
const Rdv = require('../models/Rdv');

// Get one user by username
exports.getOneUser = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .populate({
                path: 'rdv_ids',
                populate: {
                    path: 'client_id artist_id',
                    select: 'name' // Adjust as per your User model
                }
            })
            .exec();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const response = {
            username: user.username,
            email: user.email,
            lastname: user.lastname,
            firstname: user.firstname,
            role: user.role,
            flash: user.flash,
            rdvs: user.rdv_ids
        };

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .populate({
                path: 'rdv_ids',
                populate: {
                    path: 'client_id artist_id',
                    select: 'name' // Adjust as per your User model
                }
            })
            .exec();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a user by ID
exports.updateUserById = async (req, res) => {
    try {
        const updateData = req.body;

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a user by ID
exports.deleteUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optionally, you can remove the RDVs associated with the user
        await Rdv.deleteMany({ artist_id: user._id });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addFlashToLiked = async (req, res) => {
    try {
        const userId = req.auth.userId; // Get user ID from authenticated user
        const flashId = req.params.flashId; // Get flash ID from request parameters

        // Find the user and update their liked flashes
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the flash is already liked
        if (user.liked_flashes.includes(flashId)) {
            return res.status(400).json({ message: 'Flash already liked' });
        }

        // Add the flash to the liked_flashes array
        user.liked_flashes.push(flashId);
        await user.save();

        res.status(200).json({ message: 'Flash liked successfully', liked_flashes: user.liked_flashes });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
};

exports.getLikedFlashes = async (req, res) => {
    try {
        const userId = req.auth.userId; // Get user ID from authenticated user
        console.log('User ID:', userId); // Log the user ID

        // Find the user and populate liked flashes
        const user = await User.findById(userId)
            .populate('liked_flashes')
            .exec();

        if (!user) {
            console.log('User ID:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.liked_flashes);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
};