const User = require('../models/User');

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const updates = req.body;
  // If avatar is sent as file, handle file upload here
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json(user);
};