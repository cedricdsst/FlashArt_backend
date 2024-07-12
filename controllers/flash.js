const Flash = require('../models/Flash');
const User = require('../models/User');
const { haversineDistance } = require('../services/distanceService');

// Create a new flash and associate it with a user
exports.createFlash = async (req, res) => {
    try {
        const user_id = req.auth.userId;
        const image = req.file ? `${req.protocol}://${req.get('host')}/topicFiles/${req.file.filename}` : null;
        const flashObject = JSON.parse(req.body.flash);

        console.log('Creating flash with the following data:', flashObject);


        const flash = new Flash({ ...flashObject, image, user_id });
        await flash.save();
        console.log('Flash saved:', flash);


        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.flash.push({
            id: flash._id,
            image: flash.image,
            price: flash.price,
            tags: flash.tags,
            available: flash.available
        });

        await user.save();
        console.log('User updated with new flash:', user);

        res.status(201).json({ message: 'Flash created successfully', flash });
    } catch (error) {
        console.error('Error creating flash:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateFlash = async (req, res) => {
    try {
        const user_id = req.auth.userId;
        const flashId = req.params.flashId;
        const flashObject = JSON.parse(req.body.flash);

        const updateData = flashObject;
        if (req.file) {
            updateData.image = `${req.protocol}://${req.get('host')}/topicFiles/${req.file.filename}`;
        }


        const flash = await Flash.findById(flashId);
        if (!flash) {
            return res.status(404).json({ message: 'Flash not found' });
        }
        if (flash.user_id.toString() !== user_id) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        // Update the flash
        Object.keys(updateData).forEach(key => {
            flash[key] = updateData[key];
        });
        await flash.save();

        // Find the user and update their embedded flash field
        const user = await User.findById(user_id);
        if (user.flash.id.toString() === flashId) {
            Object.keys(updateData).forEach(key => {
                if (key !== 'flashId') {
                    user.flash[key] = updateData[key];
                }
            });
            await user.save();
        }

        res.status(200).json({ message: 'Flash updated successfully', flash });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Delete a flash
exports.deleteFlash = async (req, res) => {
    try {
        const user_id = req.auth.userId;
        const flashId = req.params.flashId;

        // Find the flash and check if the user is authorized
        const flash = await Flash.findById(flashId);
        if (!flash) {
            return res.status(404).json({ message: 'Flash not found' });
        }
        if (flash.user_id.toString() !== user_id) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        // Delete the flash
        await Flash.deleteOne({ _id: flashId });

        // Find the user and remove the embedded flash field
        const user = await User.findById(user_id);
        if (user.flash && user.flash.id.toString() === flashId) {
            user.flash = null;
            await user.save();
        }

        res.status(200).json({ message: 'Flash deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'An unknown error occurred' });
    }
};


// Get all flashes with optional tag filtering
exports.getAllFlashes = async (req, res) => {
    try {
        const tags = req.query.tags ? req.query.tags.split(',') : [];
        const days = req.query.days ? parseInt(req.query.days, 10) : null;
        const location = req.query.location ? req.query.location.split(',').map(Number) : null;
        const km = req.query.km ? parseFloat(req.query.km) : null;

        console.log('Query Parameters:', { tags, days, location, km });

        let flashes;
        if (tags.length > 0) {
            flashes = await Flash.find({ tags: { $elemMatch: { name: { $in: tags } } } })
                .populate({
                    path: 'user_id',
                    select: 'username lastname firstname',
                    populate: {
                        path: 'rdv_ids',
                        model: 'Rdv'
                    }
                });
        } else {
            flashes = await Flash.find()
                .populate({
                    path: 'user_id',
                    select: 'username lastname firstname',
                    populate: {
                        path: 'rdv_ids',
                        model: 'Rdv'
                    }
                });
        }

        console.log('Found Flashes:', flashes);

        const now = new Date();

        if (days !== null || location !== null) {
            flashes = flashes.filter(flash => {
                return flash.user_id.rdv_ids.some(rdv => {
                    const rdvDate = new Date(rdv.date);
                    const dateCondition = !days || (rdvDate >= now && rdvDate <= new Date(now.getTime() + days * 24 * 60 * 60 * 1000));

                    const locationCondition = location && rdv.location && rdv.location.coordinates
                        ? haversineDistance(location, rdv.location.coordinates) <= km
                        : true;

                    return dateCondition && locationCondition;
                });
            });
        }

        res.status(200).json(flashes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
// Get a single flash by ID
exports.getFlashById = async (req, res) => {
    try {
        const flashId = req.params.flashId;

        const flash = await Flash.findById(flashId)
            .populate({
                path: 'user_id',
                select: 'username lastname firstname',
                populate: {
                    path: 'rdv_ids',
                    model: 'Rdv'
                }
            });

        if (!flash) {
            return res.status(404).json({ message: 'Flash not found' });
        }

        res.status(200).json(flash);
    } catch (error) {
        res.status(500).json({ error });
    }
};
