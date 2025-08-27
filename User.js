const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  duration: String,
  description: String,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  department: String,
  bio: String,
  avatar: String,
  skills: [String],
  experience: [experienceSchema],
  role: { type: String, enum: ['hr', 'applicant', 'admin'], default: 'hr' },
  password: String, // hash
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);