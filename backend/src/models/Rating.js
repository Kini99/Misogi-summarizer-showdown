const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  modelName: {
    type: String,
    required: true
  },
  modelType: {
    type: String,
    enum: ['closed', 'open'],
    required: true
  },
  clarity: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  accuracy: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  conciseness: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  preferred: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Rating', ratingSchema); 