const Tag = require('../models/Tag');

// Create a new tag
exports.createTag = async (req, res) => {
    try {
        const { name } = req.body;
        const tag = new Tag({ name });
        await tag.save();
        res.status(201).json({ message: 'Tag created successfully', tag });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all tags
exports.getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find();
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a tag by ID
exports.getTagById = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        res.status(200).json(tag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a tag by ID
exports.updateTagById = async (req, res) => {
    try {
        const { name } = req.body;
        const tag = await Tag.findByIdAndUpdate(req.params.id, { name }, { new: true });
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        res.status(200).json({ message: 'Tag updated successfully', tag });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a tag by ID
exports.deleteTagById = async (req, res) => {
    try {
        const tag = await Tag.findByIdAndDelete(req.params.id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
