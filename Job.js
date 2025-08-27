const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  postedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Job', jobSchema);