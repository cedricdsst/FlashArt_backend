const Rdv = require('../models/Rdv');

// Create an RDV
exports.createRdv = async (req, res) => {
    try {
        const { client_id, artist_id, date, coordinates } = req.body;
        const rdv = new Rdv({
            client_id,
            artist_id,
            date,
            location: {
                type: 'Point',
                coordinates
            }
        });

        await rdv.save();
        res.status(201).json({ message: 'RDV created successfully', rdv });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get an RDV by ID
exports.getRdvById = async (req, res) => {
    try {
        const rdv = await Rdv.findById(req.params.id)
            .populate('client_id', 'name') // Adjust the fields as needed based on your Ecole model
            .populate('artist_id', 'name'); // Adjust the fields as needed based on your Ecole model

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
            .populate('client_id', 'name') // Adjust the fields as needed based on your Ecole model
            .populate('artist_id', 'name'); // Adjust the fields as needed based on your Ecole model

        res.status(200).json(rdvs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an RDV by ID
exports.updateRdvById = async (req, res) => {
    try {
        const { client_id, artist_id, date, coordinates } = req.body;
        const rdv = await Rdv.findByIdAndUpdate(req.params.id, {
            client_id,
            artist_id,
            date,
            location: {
                type: 'Point',
                coordinates
            }
        }, { new: true });

        if (!rdv) {
            return res.status(404).json({ message: 'RDV not found' });
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

        res.status(200).json({ message: 'RDV deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
