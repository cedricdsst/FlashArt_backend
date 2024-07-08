const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
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

const rdvSchema = mongoose.Schema({
    client_id: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Ecole' },
    tatooist_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Ecole' },
    date: { type: Date, required: true },
    
    location: {
        type: pointSchema,
        index: '2dsphere'
    },
});



module.exports = mongoose.model('Rdv', rdvSchema);