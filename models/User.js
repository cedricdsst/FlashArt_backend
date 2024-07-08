const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Define the Flash Schema embedded in User
const tagSchema = mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: true },
    name: { type: String, required: true }
});

const flashSchema = mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Flash', required: true },
    image: { type: String, required: true },
    tags: [tagSchema],
    available: { type: Boolean, required: true, default: true }
});

// Define the User Schema
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    lastname: { type: String, required: true, unique: false },
    firstname: { type: String, required: true, unique: false },
    username: { type: String, required: true, unique: true },
    role: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    flash: flashSchema, // Embed the flash schema here
    rdv_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rdv'
    }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
