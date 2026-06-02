const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    enum: ['Dog', 'Cat', 'Other']
  },
  breed: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: String,
    required: false
  },
  gender: {
    type: String,
    required: false
  },
  weight: {
    type: String,
    required: false
  },
  vaccinationStatus: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true
  },
  fee: {
    type: Number,
    required: false
  },
  location: {
    type: String,
    required: true
  },
  lastSeenDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'adopted', 'lost', 'found', 'reunited', 'personal']
  },
  photos: {
    type: [String],
    default: []
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Pet', petSchema);
