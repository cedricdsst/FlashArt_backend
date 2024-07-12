const mongoose = require('mongoose');


const tagSchema = mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: true },
    name: { type: String, required: true }
});


const flashSchema = mongoose.Schema({
    image: { type: String, required: true },
    price: { type: Number, required: true },
    tags: [tagSchema],
    available: { type: Boolean, required: true, default: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to the User
});

module.exports = mongoose.model('Flash', flashSchema);
