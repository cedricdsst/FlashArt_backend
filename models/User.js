const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    lastname: { type: String, required: true, unique: false },
    firstname: { type: String, required: true, unique: false },
    username: { type: String, required: true, unique: true },
    role:{ type: String, required: true, unique: true },
    password: { type: String, required: true },
    flash_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flash'
    }],
    rdv_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rdv'
    }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);