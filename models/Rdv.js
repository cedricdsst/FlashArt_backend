const mongoose = require('mongoose');

const rdvSchema = mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
  artist_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  properties: {
    title: { type: String, required: true },
    address: { type: String, required: true }
  },
  flash_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Flash', required: false },
  booked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Rdv', rdvSchema);