const Flash = require('../models/Flash');
const User = require('../models/User');

// Create a new flash and associate it with a user
exports.createFlash = async (req, res) => {
    try {
        const user_id = req.auth.userId;
        const image = req.file ? `${req.protocol}://${req.get('host')}/topicFiles/${req.file.filename}` : null;
        const flashObject = JSON.parse(req.body.flash);

        // Create a new flash (available will be true by default)
        const flash = new Flash({ ...flashObject, image, user_id });
        await flash.save();

        // Find the user and update their flash field
        const user = await User.findById(user_id);
        user.flash = {
            id: flash._id,
            image: flash.image,
            tags: flash.tags,
            available: flash.available // This will be true by default as per the schema
        };
        await user.save();

        res.status(201).json({ message: 'Flash created successfully', flash });
    } catch (error) {
        res.status(500).json({ error });
    }
};


// Partially update an existing flash
exports.updateFlash = async (req, res) => {
    try {
        const user_id = req.auth.userId;
        const flashObject = JSON.parse(req.body.flash);
        const { flashId } = flashObject;

        const updateData = flashObject;
        if (req.file) {
            updateData.image = `${req.protocol}://${req.get('host')}/topicFiles/${req.file.filename}`;
        }

        // Find the flash and check if the user is authorized
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
        const { flashId } = req.body;

        // Find the flash and check if the user is authorized
        const flash = await Flash.findById(flashId);
        if (!flash) {
            return res.status(404).json({ message: 'Flash not found' });
        }
        if (flash.user_id.toString() !== user_id) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        // Delete the flash
        await flash.remove();

        // Find the user and remove the embedded flash field
        const user = await User.findById(user_id);
        if (user.flash.id.toString() === flashId) {
            user.flash = null;
            await user.save();
        }

        res.status(200).json({ message: 'Flash deleted successfully' });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Get all flashes with optional tag filtering
exports.getAllFlashes = async (req, res) => {
    try {
        const tags = req.query.tags ? req.query.tags.split(',') : [];

        let flashes;
        if (tags.length > 0) {
            flashes = await Flash.find({ 'tags.name': { $in: tags } });
        } else {
            flashes = await Flash.find();
        }

        res.status(200).json(flashes);
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Get a single flash by ID
exports.getFlashById = async (req, res) => {
    try {
        const { flashId } = req.body;

        const flash = await Flash.findById(flashId);

        if (!flash) {
            return res.status(404).json({ message: 'Flash not found' });
        }

        res.status(200).json(flash);
    } catch (error) {
        res.status(500).json({ error });
    }
};
