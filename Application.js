const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applicantName: String,
  status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  matchScore: Number,
});

module.exports = mongoose.model('Application', applicationSchema);