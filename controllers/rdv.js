const mongoose = require('mongoose');
const Rdv = require('../models/Rdv');
const User = require('../models/User');
const Flash = require('../models/Flash');

// Create an RDV
exports.createRdv = async (req, res) => {
    try {
        const artist_id = req.auth.userId;
        const { date, location, properties } = req.body;

        const rdv = new Rdv({
            artist_id,
            date,
            location: {
                type: 'Point',
                coordinates: location.coordinates,
            },
            properties: {
                title: properties.title || '',
                address: properties.address

            }
        });

        await rdv.save();

        // Add the RDV ID to the user's rdv_ids array
        const user = await User.findById(artist_id);
        user.rdv_ids.push(rdv._id);
        await user.save();

        res.status(201).json({ message: 'RDV created successfully', rdv });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Book an RDV
exports.bookRdv = async (req, res) => {
    try {
        const client_id = req.auth.userId;
        const { rdvId, flashId } = req.body;

        // Find the RDV
        const rdv = await Rdv.findById(rdvId);
        if (!rdv) {
            return res.status(404).json({ message: 'RDV not found' });
        }

        // Update RDV with client_id, flash_id and booked status
        rdv.client_id = client_id;
        rdv.flash_id = flashId;
        rdv.booked = true;
        await rdv.save();

        // Update the flash to set available to false
        const flash = await Flash.findById(flashId);
        if (flash) {
            flash.available = false;
            await flash.save();
        }

        // Add the RDV ID to the client's rdv_ids array
        const user = await User.findById(client_id);
        user.rdv_ids.push(rdv._id);
        await user.save();

        res.status(200).json({ message: 'RDV booked successfully', rdv });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Get an RDV by ID
exports.getRdvById = async (req, res) => {
    try {
        const rdv = await Rdv.findById(req.params.id)
            .populate('client_id', 'name')
            .populate('artist_id', 'username');

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
        const userId = req.auth.userId;

        const rdvs = await Rdv.find({ artist_id: userId })
            .populate('client_id', 'username')
            .populate('artist_id', 'username')
            .populate('flash_id');

        res.status(200).json(rdvs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getAllRdvsForClient = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const rdvs = await Rdv.find({ client_id: userId })
            .populate('client_id', 'username')
            .populate('artist_id', 'username')
            .populate('flash_id');

        res.status(200).json(rdvs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




exports.updateRdvById = async (req, res) => {
    try {
        const artist_id = req.auth.userId;
        const updateData = req.body;


        updateData.artist_id = artist_id;


        const existingRdv = await Rdv.findById(req.params.id);
        if (!existingRdv) {
            return res.status(404).json({ message: 'RDV not found' });
        }

        const previousClientId = existingRdv.client_id;


        if (updateData.client_id) {
            updateData.client_id = new mongoose.Types.ObjectId(updateData.client_id);
        }


        if (updateData.coordinates && updateData.title && updateData.address) {
            updateData.location = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: updateData.coordinates
                },
                properties: {
                    title: updateData.title,
                    address: updateData.address
                }
            };
            delete updateData.coordinates;
            delete updateData.title;
            delete updateData.address;
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
        const userId = req.auth.userId;
        const rdv = await Rdv.findById(req.params.id);

        if (!rdv) {
            return res.status(404).json({ message: 'RDV not found' });
        }

        // Check if the user is the artist who created the RDV
        if (rdv.artist_id.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        // Delete the RDV
        await Rdv.findByIdAndDelete(req.params.id);

        // Remove the RDV ID from the artist's rdv_ids array
        const user = await User.findById(rdv.artist_id);
        if (user) {
            user.rdv_ids = user.rdv_ids.filter(rdvId => !rdvId.equals(rdv._id));
            await user.save();
        }

        // Optionally, remove the RDV ID from the client's rdv_ids array if client_id is present
        if (rdv.client_id) {
            const client = await User.findById(rdv.client_id);
            if (client) {
                client.rdv_ids = client.rdv_ids.filter(rdvId => !rdvId.equals(rdv._id));
                await client.save();
            }
        }

        res.status(200).json({ message: 'RDV deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'An unknown error occurred' });
    }
};
