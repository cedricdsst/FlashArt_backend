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
