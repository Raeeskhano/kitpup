const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found', 'rescue'],
    default: 'rescue'
  },
  animalType: {
    type: String,
    required: true
  },
  urgencyLevel: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['report_received', 'investigation_in_progress', 'rescued_safely'],
    default: 'report_received'
  },
  photos: [{
    type: String
  }],
  dateReported: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
