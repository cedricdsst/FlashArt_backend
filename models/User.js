const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


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


const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    lastname: { type: String, required: true, unique: false },
    firstname: { type: String, required: true, unique: false },
    username: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    flash: [flashSchema],
    rdv_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rdv'
    }],
    liked_flashes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flash'
    }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
