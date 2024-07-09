const mongoose = require('mongoose');
const Rdv = require('../models/Rdv');
const User = require('../models/User');

// Create an RDV
exports.createRdv = async (req, res) => {
    try {
        const artist_id = req.auth.userId; // Get artist ID from authenticated user
        const { date, coordinates, title, adress } = req.body;
        const rdv = new Rdv({
            artist_id,
            date,
            location: {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates
                },
                properties: {
                    title,
                    adress
                }
            }
        });

        await rdv.save();

        // Add the RDV ID to the user's rdv_ids array
        const user = await User.findById(artist_id);
        user.rdv_ids.push(rdv._id);
        await user.save();

        res.status(201).json({ message: 'RDV created successfully', rdv });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get an RDV by ID
exports.getRdvById = async (req, res) => {
    try {
        const rdv = await Rdv.findById(req.params.id)
            .populate('client_id', 'name') // Adjust the fields as needed based on your User model
            .populate('artist_id', 'username'); // Adjust the fields as needed based on your User model

        if (!rdv) {
            return res.status(404).json({ message: 'RDV not found' });
        }

        res.status(200).json(rdv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all RDVs
exports.getAllRdvs = async (req, res) => {
    try {
        const rdvs = await Rdv.find()
            .populate('client_id', 'name') // Adjust the fields as needed based on your User model
            .populate('artist_id', 'username'); // Adjust the fields as needed based on your User model

        res.status(200).json(rdvs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Partially update an existing RDV
exports.updateRdvById = async (req, res) => {
    try {
        const artist_id = req.auth.userId; // Get artist ID from authenticated user
        const updateData = req.body;

        // Ensure artist_id from the authenticated user is included in the update data
        updateData.artist_id = artist_id;

        // Fetch the existing RDV to get the current client_id
        const existingRdv = await Rdv.findById(req.params.id);
        if (!existingRdv) {
            return res.status(404).json({ message: 'RDV not found' });
        }
        
        const previousClientId = existingRdv.client_id;

        // Convert client_id to ObjectId if it exists in the update data
        if (updateData.client_id) {
            updateData.client_id = new mongoose.Types.ObjectId(updateData.client_id);
        }

        // If coordinates are provided, format them correctly
        if (updateData.coordinates && updateData.title && updateData.adress) {
            updateData.location = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: updateData.coordinates
                },
                properties: {
                    title: updateData.title,
                    adress: updateData.adress
                }
            };
            delete updateData.coordinates; // Remove coordinates from the update data to avoid duplication
            delete updateData.title;
            delete updateData.adress;
        }

        const rdv = await Rdv.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!rdv) {
            return res.status(404).json({ message: 'RDV not found' });
        }

        // If client_id has changed, update the rdv_ids array of the new client
        if (updateData.client_id && updateData.client_id.toString() !== previousClientId.toString()) {
            // Remove the RDV ID from the previous client's rdv_ids array
            if (previousClientId) {
                await User.findByIdAndUpdate(previousClientId, {
                    $pull: { rdv_ids: rdv._id }
                });
            }

            // Add the RDV ID to the new client's rdv_ids array
            await User.findByIdAndUpdate(updateData.client_id, {
                $addToSet: { rdv_ids: rdv._id }
            });
        }

        res.status(200).json({ message: 'RDV updated successfully', rdv });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Delete an RDV by ID
exports.deleteRdvById = async (req, res) => {
    try {
        const rdv = await Rdv.findByIdAndDelete(req.params.id);

        if (!rdv) {
            return res.status(404).json({ message: 'RDV not found' });
        }

        // Remove the RDV ID from the user's rdv_ids array
        const user = await User.findById(rdv.artist_id);
        user.rdv_ids = user.rdv_ids.filter(rdvId => !rdvId.equals(rdv._id));
        await user.save();

        res.status(200).json({ message: 'RDV deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

