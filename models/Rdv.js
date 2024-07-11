const mongoose = require('mongoose');

const geometrySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Feature'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  },
  properties: {
    title: { type: String, required: true },
    address: { type: String, required: true }
  }
});

const rdvSchema = mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
  artist_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, required: true },
  location: locationSchema,
  flash_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Flash', required: false }, // New field for flash_id
  booked: { type: Boolean, default: false } // New field for booked status
});

module.exports = mongoose.model('Rdv', rdvSchema);